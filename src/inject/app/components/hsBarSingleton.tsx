import React from 'react'
import { createRoot, Root } from 'react-dom/client'
import {
  HsAutofillBar,
  HsBarState,
} from './HsAutofillBar'

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

interface BarMatch {
  company: string
  role: string
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
  match: BarMatch | null
  matchRequested: boolean
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
          if (
            data &&
            typeof data === 'object' &&
            'company' in data &&
            'role' in data
          ) {
            const company = String((data as { company: unknown }).company)
            const role = String((data as { role: unknown }).role)
            state.match = { company, role }
            state.barState = { kind: 'matched', company, role }
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
