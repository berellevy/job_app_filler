/**
 * HiredSignal background service worker.
 *
 * Owns the PAT, makes authenticated HTTPS calls to hiredsignal.com, and serves
 * results to content/inject scripts via chrome.runtime messages. Also handles
 * AI open-text answer generation — the LLM call lives here because MV3 CORS
 * blocks cross-origin fetch from content scripts; the content script relays via
 * chrome.runtime.sendMessage.
 *
 * NOTE: relies on host_permissions for hiredsignal.com (and the AI endpoint)
 * being present in manifest.json.
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
import { generateAiAnswer } from './aiAnswerService'
import {
  AiGenerateAnswerResponse,
  isAiGenerateAnswerRequest,
} from '@src/shared/utils/ai/types'

type HsResponseData = HsMatch | HsCandidate | HsCvFile | HsAuthStatus

function unauthResponse<T>(message: string): HsResult<T> {
  return { ok: false, error: { code: 'unauthenticated', message } }
}

function invalidResponse<T>(message: string): HsResult<T> {
  return { ok: false, error: { code: 'invalid_response', message } }
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  return 'Unexpected error'
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
    // AI open-text answer generation.
    if (isAiGenerateAnswerRequest(raw)) {
      generateAiAnswer(raw.context)
        .then((answer: string) => {
          const response: AiGenerateAnswerResponse = { ok: true, answer }
          sendResponse(response)
        })
        .catch((error: unknown) => {
          const response: AiGenerateAnswerResponse = {
            ok: false,
            error: getErrorMessage(error),
          }
          sendResponse(response)
        })
      // Keep the message channel open for the async response.
      return true
    }

    // HiredSignal API messages.
    if (isHsMessage(raw)) {
      handleMessage(raw)
        .then((response) => sendResponse(response))
        .catch((e: unknown) => {
          const message =
            e instanceof Error ? e.message : 'background handler threw'
          sendResponse(invalidResponse(message))
        })
      // Keep the message channel open for the async response.
      return true
    }

    // Not addressed to us.
    sendResponse(invalidResponse('unrecognized message shape'))
    return false
  }
)
