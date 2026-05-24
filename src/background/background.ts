// Adapted from Br1an67/OpenJobAutofill (MIT). https://github.com/Br1an67/OpenJobAutofill
//
// Background service worker. In MV3, cross-origin fetches are CORS-restricted
// from content scripts, so the LLM call lives here (the SW is exempt) and the
// content script relays requests via chrome.runtime.sendMessage. This mirrors
// the relay pattern documented by Chromium for extension content-script fetch.

import { generateAiAnswer } from './aiAnswerService'
import {
  AiGenerateAnswerResponse,
  isAiGenerateAnswerRequest,
} from '@src/shared/utils/ai/types'

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  return 'Unexpected error'
}

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  if (!isAiGenerateAnswerRequest(message)) {
    return undefined
  }

  generateAiAnswer(message.context)
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

  // keep the message channel open for the async response
  return true
})
