/**
 * Message protocol between inject / content scripts and the background SW.
 *
 * Inject and content scripts MUST go through sendHsMessage() — they cannot
 * import the client directly (no access to the PAT, no cross-origin fetch
 * permissions in inject context).
 *
 * Binary CV bytes can't cross the chrome.runtime boundary as a Blob, so the
 * CV endpoint returns base64. Decode on the caller side.
 */

import { HsAuthStatus } from './auth'
import {
  HsCandidate,
  HsCvFile,
  HsFillField,
  HsFillResult,
  HsMatch,
  HsResult,
} from './types'

export type HsMessage =
  | { type: 'HS_MATCH'; url: string }
  | { type: 'HS_CANDIDATE' }
  | { type: 'HS_CV'; materialId: string }
  | { type: 'HS_FILL'; jobUid: string; fields: HsFillField[] }
  | { type: 'HS_AUTH_STATUS' }
  | { type: 'HS_AUTH_SET_PAT'; pat: string }
  | { type: 'HS_AUTH_CLEAR' }

export type HsResponse<T> = HsResult<T>

// -- Per-message payload typing --------------------------------------------

export interface HsMessageResponseMap {
  HS_MATCH: HsResponse<HsMatch>
  HS_CANDIDATE: HsResponse<HsCandidate>
  HS_CV: HsResponse<HsCvFile>
  HS_FILL: HsResponse<HsFillResult>
  HS_AUTH_STATUS: HsResponse<HsAuthStatus>
  HS_AUTH_SET_PAT: HsResponse<HsAuthStatus>
  HS_AUTH_CLEAR: HsResponse<HsAuthStatus>
}

// -- Dispatch helper (callable from content/inject) ------------------------

/**
 * Send an HS message to the background SW. Returns a typed HsResponse.
 *
 * In inject scripts (web_accessible_resource) chrome.runtime is not
 * available — those should proxy through their content script via the
 * existing crossContextCommunication channel.
 */
export function sendHsMessage<M extends HsMessage>(
  message: M
): Promise<HsMessageResponseMap[M['type']]> {
  return new Promise((resolve) => {
    type R = HsMessageResponseMap[M['type']]
    try {
      chrome.runtime.sendMessage(message, (response: R | undefined) => {
        const runtimeErr = chrome.runtime.lastError
        if (runtimeErr) {
          const fallback = {
            ok: false,
            error: { code: 'network', message: runtimeErr.message ?? 'runtime error' },
          } as unknown as R
          resolve(fallback)
          return
        }
        if (!response) {
          const fallback = {
            ok: false,
            error: { code: 'invalid_response', message: 'no response from background' },
          } as unknown as R
          resolve(fallback)
          return
        }
        resolve(response)
      })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'sendMessage threw'
      const fallback = {
        ok: false,
        error: { code: 'network', message: msg },
      } as unknown as R
      resolve(fallback)
    }
  })
}

// -- Convenience wrappers --------------------------------------------------

export function requestMatch(url: string): Promise<HsResponse<HsMatch>> {
  return sendHsMessage({ type: 'HS_MATCH', url })
}

export function requestCandidate(): Promise<HsResponse<HsCandidate>> {
  return sendHsMessage({ type: 'HS_CANDIDATE' })
}

export function requestCv(materialId: string): Promise<HsResponse<HsCvFile>> {
  return sendHsMessage({ type: 'HS_CV', materialId })
}

export function requestAuthStatus(): Promise<HsResponse<HsAuthStatus>> {
  return sendHsMessage({ type: 'HS_AUTH_STATUS' })
}

// -- Narrowing helper used by the background SW dispatcher -----------------

export function isHsMessage(v: unknown): v is HsMessage {
  if (typeof v !== 'object' || v === null) return false
  const o = v as { type?: unknown }
  switch (o.type) {
    case 'HS_MATCH':
      return typeof (v as { url?: unknown }).url === 'string'
    case 'HS_CANDIDATE':
    case 'HS_AUTH_STATUS':
    case 'HS_AUTH_CLEAR':
      return true
    case 'HS_CV':
      return typeof (v as { materialId?: unknown }).materialId === 'string'
    case 'HS_FILL':
      return Array.isArray((v as { fields?: unknown }).fields)
    case 'HS_AUTH_SET_PAT':
      return typeof (v as { pat?: unknown }).pat === 'string'
    default:
      return false
  }
}
