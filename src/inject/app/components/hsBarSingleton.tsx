import React from 'react'
import { createRoot, Root } from 'react-dom/client'
import {
  HsAutofillBar,
  HsBarState,
} from './HsAutofillBar'
import { HsCvFile, HsFillField, HsMatch, isHsMatch } from '@src/shared/utils/hs/types'
import { base64ToFile, setHsCv } from '@src/shared/utils/hs/cvProvider'
import {
  HsMessage,
  HsMessageResponseMap,
} from '@src/shared/utils/hs/messages'
import { sleep } from '@src/shared/utils/async'
import { contentScriptAPI } from '../services/contentScriptApi'

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

const hsMessageError = <M extends HsMessage>(
  message: string
): HsMessageResponseMap[M['type']] => {
  return {
    ok: false,
    error: { code: 'network', message },
  } as HsMessageResponseMap[M['type']]
}

const sendHsViaContentScript = async <M extends HsMessage>(
  message: M
): Promise<HsMessageResponseMap[M['type']]> => {
  try {
    const response = await contentScriptAPI.send<HsMessageResponseMap[M['type']]>(
      'sendHsMessage',
      message,
      15000
    )
    if (!response.ok || !response.data) {
      return hsMessageError<M>('content script bridge returned no HiredSignal response')
    }
    return response.data
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'content script bridge failed'
    return hsMessageError<M>(msg)
  }
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
  return sendHsViaContentScript({ type: 'HS_CV', materialId }).then((response) => {
    const cv = extractCvFile(response)
    if (cv) {
      const filename = cv.filename ?? 'hiredsignal-cv.pdf'
      try {
        setHsCv(base64ToFile(cv.bytesBase64, filename, cv.contentType))
      } catch {
        // Decode failure — leave provider empty, fall back to local.
      }
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

// ── Workday multi-page stepper ───────────────────────────────────────────────
// Workday applications span several pages (My Information → My Experience →
// questions → Review). The autofill backends only know about the CURRENT page,
// so a single fillAll() fills one page. This walks the whole flow: fill → click
// "Save and Continue" → wait for the next page's fields to register (via the
// global MutationObserver in inject.ts) → fill again, until it reaches Review.
//
// SAFETY: it NEVER clicks Submit. It stops the moment a submit button or a
// Review heading appears, and it stops if Workday refuses to advance (e.g. an
// unfilled required field triggers validation) — so it can never push a
// half-complete application through.

const MAX_WORKDAY_PAGES = 12

const isWorkday = (): boolean =>
  /myworkdayjobs\.com|myworkdaysite\.com/i.test(location.hostname)

const visibleText = (el: Element | null): string =>
  el && el instanceof HTMLElement ? (el.innerText || '').trim() : ''

// True when we've reached the end — never auto-submit past here.
const atReviewOrSubmitStep = (): boolean => {
  const submit = document.querySelector(
    'button[data-automation-id*="submit" i], button[data-automation-id="pageFooterSubmitButton"]'
  )
  if (submit) return true
  const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
  if (headings.some((h) => /\breview\b|\bsubmit\b/i.test(visibleText(h)))) return true
  const buttons = Array.from(document.querySelectorAll('button'))
  if (buttons.some((b) => /^submit\b/i.test(visibleText(b)))) return true
  return false
}

const isSafeNextButton = (b: HTMLElement): boolean => {
  const t = visibleText(b).toLowerCase()
  const aid = (b.getAttribute('data-automation-id') || '').toLowerCase()
  if (/submit/.test(t) || /submit/.test(aid)) return false
  if (/back|previous|save for later|cancel|sign out/.test(t)) return false
  return true
}

const findWorkdayNextButton = (): HTMLElement | null => {
  const byId = document.querySelector(
    'button[data-automation-id="bottom-navigation-next-button"], button[data-automation-id="pageFooterNextButton"]'
  )
  if (byId instanceof HTMLElement && isSafeNextButton(byId)) return byId
  const buttons = Array.from(document.querySelectorAll('button'))
  for (const b of buttons) {
    if (!(b instanceof HTMLElement)) continue
    const t = visibleText(b).toLowerCase()
    if (/\b(save and continue|continue|next)\b/.test(t) && isSafeNextButton(b)) {
      return b
    }
  }
  return null
}

const fillWorkdayAllPages = async (): Promise<void> => {
  for (let page = 0; page < MAX_WORKDAY_PAGES; page++) {
    await fillAll()
    await llmFillCurrentPage()
    await sleep(700)

    if (atReviewOrSubmitStep()) break // reached the end — leave Submit to the human

    const next = findWorkdayNextButton()
    if (!next) break

    const fingerprint = (): string => {
      const h = document.querySelector('h2, h1')
      return visibleText(h) + '|' + window.location.href
    }
    const before = fingerprint()
    next.click()

    // Wait for the page to actually change. If Workday blocks on validation
    // (an unfilled required field), the fingerprint won't change and we stop —
    // never forcing a half-filled page through.
    let advanced = false
    for (let w = 0; w < 15; w++) {
      await sleep(400)
      if (fingerprint() !== before) {
        advanced = true
        break
      }
    }
    if (!advanced) break
  }
}

// ── LLM field fill ───────────────────────────────────────────────────────────
// The universal path: scrape every fillable field on the current page, send the
// labels to HiredSignal (POST /api/extension/fill), and apply the answers the
// server's LLM returns from the user's CV + JD + profile. This is what fills the
// long tail the per-ATS adapters don't know about. The extension is the hands;
// the brain is on the server.

let hsFieldCounter = 0
const HS_FID = 'data-hs-fid'

const deepFormControls = (): HTMLElement[] => {
  const out: HTMLElement[] = []
  const walk = (root: Document | ShadowRoot): void => {
    try {
      root.querySelectorAll('input, textarea, select').forEach((el) => {
        if (el instanceof HTMLElement) out.push(el)
      })
    } catch {
      /* ignore */
    }
    try {
      root.querySelectorAll('*').forEach((el) => {
        const sr = (el as HTMLElement).shadowRoot
        if (sr) walk(sr)
      })
    } catch {
      /* ignore */
    }
  }
  walk(document)
  return out
}

const fieldIsVisible = (el: HTMLElement): boolean => {
  const s = window.getComputedStyle(el)
  return s.display !== 'none' && s.visibility !== 'hidden'
}

const labelForControl = (el: HTMLElement): string => {
  const inp = el as HTMLInputElement
  let viaFor = ''
  try {
    if (inp.id) {
      const sel = window.CSS ? CSS.escape(inp.id) : inp.id
      const lab = document.querySelector(`label[for="${sel}"]`)
      viaFor = lab instanceof HTMLElement ? lab.innerText : ''
    }
  } catch {
    /* ignore */
  }
  const direct = inp.labels && inp.labels[0] ? inp.labels[0].textContent || '' : ''
  return [
    inp.getAttribute('aria-label'),
    inp.getAttribute('placeholder'),
    direct,
    viaFor,
    inp.getAttribute('name'),
    inp.id,
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200)
}

const SKIP_FIELD_TYPES = new Set([
  'file', 'password', 'hidden', 'submit', 'button', 'reset', 'image', 'search',
])

const scanFields = (): { fields: HsFillField[]; map: Map<string, HTMLElement> } => {
  const map = new Map<string, HTMLElement>()
  const fields: HsFillField[] = []
  for (const el of deepFormControls()) {
    const tag = el.tagName.toLowerCase()
    const type = (
      tag === 'input' ? (el as HTMLInputElement).type || 'text' : tag
    ).toLowerCase()
    if (SKIP_FIELD_TYPES.has(type)) continue
    if (!fieldIsVisible(el)) continue
    if (
      (tag === 'input' || tag === 'textarea') &&
      (el as HTMLInputElement).value &&
      (el as HTMLInputElement).value.trim()
    ) {
      continue // don't overwrite a field that already has a value
    }
    const label = labelForControl(el)
    if (!label) continue
    const id = `hsf${++hsFieldCounter}`
    el.setAttribute(HS_FID, id)
    const field: HsFillField = { id, label, type }
    const max = (el as HTMLInputElement).maxLength
    if (typeof max === 'number' && max > 0) field.maxLength = max
    if (tag === 'select') {
      field.options = Array.from((el as HTMLSelectElement).options)
        .map((o) => (o.textContent || o.value || '').trim())
        .filter((t) => t.length > 0)
        .slice(0, 40)
    }
    fields.push(field)
    map.set(id, el)
    if (fields.length >= 60) break
  }
  return { fields, map }
}

const setNativeValue = (
  el: HTMLInputElement | HTMLTextAreaElement,
  value: string
): void => {
  const proto =
    el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype
  const desc = Object.getOwnPropertyDescriptor(proto, 'value')
  if (desc && desc.set) desc.set.call(el, value)
  else el.value = value
  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
  el.dispatchEvent(new Event('blur', { bubbles: true }))
}

const applyValue = (el: HTMLElement, value: string): void => {
  if (!value) return
  const tag = el.tagName.toLowerCase()
  try {
    if (tag === 'select') {
      const sel = el as HTMLSelectElement
      const want = value.toLowerCase()
      for (let i = 0; i < sel.options.length; i++) {
        const t = (sel.options[i].textContent || sel.options[i].value || '')
          .toLowerCase()
          .trim()
        if (t === want || t.includes(want) || want.includes(t)) {
          sel.selectedIndex = i
          sel.dispatchEvent(new Event('change', { bubbles: true }))
          return
        }
      }
    } else if (tag === 'input' || tag === 'textarea') {
      setNativeValue(el as HTMLInputElement, value)
    }
  } catch {
    /* per-field failures are non-fatal */
  }
}

const llmFillCurrentPage = async (): Promise<void> => {
  const jobUid = state.match && state.match.jobUid ? state.match.jobUid : ''
  const { fields, map } = scanFields()
  if (fields.length === 0) return
  const res = await sendHsViaContentScript({ type: 'HS_FILL', jobUid, fields })
  if (!res.ok) return
  for (const ans of res.data.answers) {
    const el = map.get(ans.id)
    if (el) applyValue(el, ans.value)
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
            // Workday spans multiple pages — walk them all (stops at Review,
            // never submits). Every other ATS is a single page.
            if (isWorkday()) {
              await fillWorkdayAllPages()
            } else {
              await fillAll()
              await llmFillCurrentPage()
            }
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

  // The bg service worker is the source of truth for HS_MATCH responses, but
  // this script runs in the page world. Route through the content script bridge.
  void sendHsViaContentScript({ type: 'HS_MATCH', url: window.location.href })
    .then((response) => {
      if (response.ok && isHsMatch(response.data)) {
        state.match = response.data
        state.barState = {
          kind: 'matched',
          label: prettifySlug(response.data.slug),
        }
      } else {
        state.barState = { kind: 'no-match' }
      }
      render()
    })
    .catch(() => {
      state.barState = { kind: 'no-match' }
      render()
    })
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
