/**
 * Message contract between popup and background service worker.
 *
 * NOTE: this file mirrors the contract that the bg-hs-client agent
 * will publish at `src/shared/utils/hs/messages.ts`. Once that branch
 * lands, this file should re-export from there to avoid drift. The
 * popup imports exclusively from this module so the swap is one-line.
 */

export interface HsCandidate {
  email: string
  fullName?: string
}

export interface HsJobMatch {
  jobUid: string
  slug: string
  applyUrl: string
  matchType: 'exact' | 'host+path' | 'host' | null
  cvMaterialId: string | null
  candidate?: HsCandidate
  /** Legacy fields accepted while older background builds age out. */
  company?: string
  role?: string
  cvName?: string
}

export type HsMessage =
  | { type: 'HS_MATCH'; url: string }
  | { type: 'HS_CANDIDATE' }
  | { type: 'HS_AUTH_STATUS' }
  | { type: 'HS_AUTH_SET_PAT'; pat: string }
  | { type: 'HS_AUTH_CLEAR' }

export interface HsError {
  code: string
  message: string
}

export interface HsResponseOk<T> {
  ok: true
  data: T
  error?: undefined
}

export interface HsResponseErr {
  ok: false
  data?: undefined
  error: HsError
}

export type HsResponse<T> = HsResponseOk<T> | HsResponseErr

export interface HsAuthStatus {
  hasPat: boolean
}

/**
 * Strongly-typed message dispatcher. Rejects with HsError on transport
 * failure so callers can show error UI without inspecting chrome.runtime.lastError.
 */
export function sendHsMessage<T>(message: HsMessage): Promise<HsResponse<T>> {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage(message, (response: HsResponse<T>) => {
        const transportErr = chrome.runtime.lastError
        if (transportErr) {
          resolve({
            ok: false,
            error: {
              code: 'TRANSPORT',
              message: transportErr.message ?? 'Background unreachable',
            },
          })
          return
        }
        if (!response) {
          resolve({
            ok: false,
            error: {
              code: 'NO_RESPONSE',
              message: 'Background returned no response',
            },
          })
          return
        }
        resolve(response)
      })
    } catch (err) {
      resolve({
        ok: false,
        error: {
          code: 'EXCEPTION',
          message: err instanceof Error ? err.message : String(err),
        },
      })
    }
  })
}
