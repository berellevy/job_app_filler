/**
 * HiredSignal background service worker.
 *
 * Owns the PAT, makes authenticated HTTPS calls to hiredsignal.com, and
 * serves results to content/inject scripts via chrome.runtime messages.
 *
 * NOTE: This SW relies on host_permissions for hiredsignal.com being
 * present in manifest.json — that file is owned by the rebrand agent.
 * Until that lands, fetch() calls will be blocked by MV3 CORS.
 */

import {
  clearPat,
  getAuthStatus,
  HsAuthStatus,
  setPat,
} from '../shared/utils/hs/auth'
import {
  fetchCandidate,
  fetchCv,
  fetchMatch,
} from '../shared/utils/hs/client'
import { HsMessage, isHsMessage } from '../shared/utils/hs/messages'
import {
  HsCandidate,
  HsCvFile,
  HsMatch,
  HsResult,
} from '../shared/utils/hs/types'

type HsResponseData = HsMatch | HsCandidate | HsCvFile | HsAuthStatus

function unauthResponse<T>(message: string): HsResult<T> {
  return { ok: false, error: { code: 'unauthenticated', message } }
}

function invalidResponse<T>(message: string): HsResult<T> {
  return { ok: false, error: { code: 'invalid_response', message } }
}

async function handleMessage(msg: HsMessage): Promise<HsResult<HsResponseData>> {
  switch (msg.type) {
    case 'HS_MATCH':
      return fetchMatch(msg.url)
    case 'HS_CANDIDATE':
      return fetchCandidate()
    case 'HS_CV':
      return fetchCv(msg.materialId)
    case 'HS_AUTH_STATUS': {
      const status = await getAuthStatus()
      return { ok: true, data: status }
    }
    case 'HS_AUTH_SET_PAT': {
      try {
        await setPat(msg.pat)
        const status: HsAuthStatus = await getAuthStatus()
        return { ok: true, data: status }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'setPat failed'
        return unauthResponse<HsAuthStatus>(message)
      }
    }
    case 'HS_AUTH_CLEAR': {
      await clearPat()
      const status = await getAuthStatus()
      return { ok: true, data: status }
    }
  }
}

type RuntimeSendResponse = (response: unknown) => void

chrome.runtime.onMessage.addListener(
  (
    raw: unknown,
    _sender: chrome.runtime.MessageSender,
    sendResponse: RuntimeSendResponse
  ): boolean => {
    if (!isHsMessage(raw)) {
      // Not addressed to us — surface a typed error so callers can
      // distinguish from a real backend invalid_response.
      sendResponse(invalidResponse('unrecognized message shape'))
      return false
    }

    handleMessage(raw)
      .then((response) => sendResponse(response))
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : 'background handler threw'
        sendResponse(invalidResponse(message))
      })

    // Keep the message channel open for the async response.
    return true
  }
)
