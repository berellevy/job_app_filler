import React from 'react'
import { createRoot, Root } from 'react-dom/client'
import {
  HsAutofillBar,
  HsBarState,
} from './HsAutofillBar'
import { HsCvFile, HsMatch, isHsMatch } from '@src/shared/utils/hs/types'
import { base64ToFile, setHsCv } from '@src/shared/utils/hs/cvProvider'

/**
 * Page-global singleton that owns:
 *  - the registry of BaseFormInput-like backends currently mounted on the page
 *  - the React root for the floating HS bar
 *  - the message bridge to the background SW for HS_MATCH lookups
 *
 * Per-field React mounts (the existing `attachReactApp` lifecycle the adapters
 * call) render nothing visible — they merely call `registerBackend(backend)`
 * during mount and `unregisterBackend(backend)` on unmount. That keeps the
 * adapter contract intact while shifting the entire UX into one shared bar.
 */

interface BackendLike {
  fill: () => Promise<unknown>
}

interface HsBarSingleton {
  registerBackend: (backend: BackendLike) => void
  unregisterBackend: (backend: BackendLike) => void
}

interface InternalState {
  backends: Set<BackendLike>
  root: Root | null
  host: HTMLDivElement | null
  barState: HsBarState
  match: HsMatch | null
  matchRequested: boolean
}

/**
 * Turn a job slug (e.g. `senior-frontend-engineer-acme-london`) into a
 * human-friendly label for the bar. There is no company/role on HsMatch, so
 * the slug is the only display signal we have.
 */
const prettifySlug = (slug: string): string => {
  const words = slug
    .split(/[-_/]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0)
  if (words.length === 0) return 'HiredSignal job'
  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/**
 * Narrow an HsResult-shaped response and pull the HsCvFile payload out of it.
 * Returns null on any failure so the caller can proceed to fill anyway.
 */
const extractCvFile = (response: unknown): HsCvFile | null => {
  if (
    !response ||
    typeof response !== 'object' ||
    !('ok' in response) ||
    (response as { ok: unknown }).ok !== true ||
    !('data' in response)
  ) {
    return null
  }
  const data = (response as { data: unknown }).data
  if (
    !data ||
    typeof data !== 'object' ||
    typeof (data as { bytesBase64?: unknown }).bytesBase64 !== 'string' ||
    typeof (data as { contentType?: unknown }).contentType !== 'string'
  ) {
    return null
  }
  const filename = (data as { filename?: unknown }).filename
  return {
    bytesBase64: (data as { bytesBase64: string }).bytesBase64,
    contentType: (data as { contentType: string }).contentType,
    filename: typeof filename === 'string' ? filename : null,
  }
}

/**
 * Fetch the matched job's CV from the background SW and stash it in the
 * cvProvider so every file-upload adapter prefers it. Best-effort: any failure
 * (no cvMaterialId, SW error, decode error) leaves the provider empty and the
 * adapters fall back to the locally-saved answer.
 */
const loadHsCv = (materialId: string): Promise<void> => {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage(
        { type: 'HS_CV', materialId },
        (response: unknown) => {
          if (chrome.runtime.lastError) {
            resolve()
            return
          }
          const cv = extractCvFile(response)
          if (cv) {
            const filename = cv.filename ?? 'hiredsignal-cv.pdf'
            try {
              setHsCv(base64ToFile(cv.bytesBase64, filename, cv.contentType))
            } catch {
              // Decode failure — leave provider empty, fall back to local.
            }
          }
          resolve()
        }
      )
    } catch {
      resolve()
    }
  })
}

const state: InternalState = {
  backends: new Set<BackendLike>(),
  root: null,
  host: null,
  barState: { kind: 'detecting' },
  match: null,
  matchRequested: false,
}

const dismissBar = (): void => {
  if (state.host) state.host.style.display = 'none'
}

const ensureHost = (): { host: HTMLDivElement; root: Root } => {
  if (state.host && state.root) {
    return { host: state.host, root: state.root }
  }
  const existing = document.getElementById('hs-autofill-bar-host')
  if (existing instanceof HTMLDivElement) {
    state.host = existing
  } else {
    const div = document.createElement('div')
    div.id = 'hs-autofill-bar-host'
    document.body.appendChild(div)
    state.host = div
  }
  state.root = createRoot(state.host)
  // Keyboard accessibility: Esc dismisses the bar from anywhere on the page.
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') dismissBar()
  })
  return { host: state.host, root: state.root }
}

const fillAll = async (): Promise<void> => {
  const snapshot = Array.from(state.backends)
  for (const backend of snapshot) {
    try {
      await backend.fill()
    } catch {
      // Per-field fill failures are swallowed here — overall progress continues.
      // The aggregated error state is surfaced only if every backend throws.
    }
  }
}

const render = (): void => {
  const { root } = ensureHost()
  root.render(
    <HsAutofillBar
      state={state.barState}
      onFill={() => {
        void (async () => {
          state.barState = { kind: 'filling', progress: 0 }
          render()
          try {
            // Prefer the matched job's HiredSignal CV when one is available.
            // Best-effort: failures leave the provider empty and adapters fall
            // back to the locally-saved answer.
            const materialId = state.match?.cvMaterialId
            if (materialId) {
              await loadHsCv(materialId)
            }
            await fillAll()
            state.barState = { kind: 'done' }
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            state.barState = { kind: 'error', message }
          }
          render()
        })()
      }}
      onDismiss={dismissBar}
    />
  )
}

const requestMatch = (): void => {
  if (state.matchRequested) return
  state.matchRequested = true

  // The bg service worker is the source of truth for HS_MATCH responses.
  // We use chrome.runtime.sendMessage exactly once per page load. If the
  // call fails (e.g. SW not yet ready) we fall back to the 'no-match'
  // state and let the user re-open the popup.
  try {
    chrome.runtime.sendMessage(
      { type: 'HS_MATCH', url: window.location.href },
      (response: unknown) => {
        if (chrome.runtime.lastError) {
          state.barState = { kind: 'no-match' }
          render()
          return
        }
        if (
          response &&
          typeof response === 'object' &&
          'ok' in response &&
          (response as { ok: boolean }).ok === true &&
          'data' in response
        ) {
          const data = (response as { data: unknown }).data
          if (isHsMatch(data)) {
            state.match = data
            state.barState = {
              kind: 'matched',
              label: prettifySlug(data.slug),
            }
            render()
            return
          }
        }
        state.barState = { kind: 'no-match' }
        render()
      }
    )
  } catch {
    state.barState = { kind: 'no-match' }
    render()
  }
}

export const hsBarSingleton: HsBarSingleton = {
  registerBackend(backend) {
    state.backends.add(backend)
    if (state.host === null) {
      ensureHost()
      render()
      requestMatch()
    }
  },
  unregisterBackend(backend) {
    state.backends.delete(backend)
  },
}
