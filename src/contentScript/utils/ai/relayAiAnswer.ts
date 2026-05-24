// Adapted from Br1an67/OpenJobAutofill (MIT). https://github.com/Br1an67/OpenJobAutofill

import {
  AI_GENERATE_ANSWER_MESSAGE,
  AiAnswerContext,
  AiGenerateAnswerRequest,
  AiGenerateAnswerResponse,
} from '@src/shared/utils/ai/types'

const isAiGenerateAnswerResponse = (
  value: unknown
): value is AiGenerateAnswerResponse => {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  return typeof (value as Record<string, unknown>).ok === 'boolean'
}

/**
 * Relays an open-text answer-generation request from the content script to the
 * background service worker (where the CORS-exempt LLM fetch happens) and
 * returns the generated answer string.
 *
 * Registered as a content-script server method so the injected React UI can
 * invoke it through the same `contentScriptAPI.send(...)` channel used for
 * saved answers, letting a generated answer flow through the normal fill path.
 */
export const relayAiAnswer = async (
  context: AiAnswerContext
): Promise<string> => {
  const request: AiGenerateAnswerRequest = {
    type: AI_GENERATE_ANSWER_MESSAGE,
    context,
  }

  const response: unknown = await chrome.runtime.sendMessage(request)

  if (!isAiGenerateAnswerResponse(response)) {
    throw new Error('AI background worker returned an unexpected response.')
  }
  if (response.ok && typeof response.answer === 'string') {
    return response.answer
  }
  throw new Error(response.error || 'AI answer generation failed.')
}
