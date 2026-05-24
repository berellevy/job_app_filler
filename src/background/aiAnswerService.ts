import {
  AI_CONFIG_STORAGE_KEY,
  AiAnswerConfig,
  AiAnswerContext,
  DEFAULT_AI_ANSWER_CONFIG,
} from '@src/shared/utils/ai/types'

/** Hard ceiling so a misconfigured maxlength can never blow up the prompt. */
const ABSOLUTE_MAX_ANSWER_CHARS = 4000

interface ChatMessage {
  role: 'system' | 'user'
  content: string
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | Array<{ text?: string; content?: string }>
    }
  }>
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  return 'Unexpected error'
}

/**
 * Reads the AI config from extension storage and merges it over defaults.
 * The API key is only ever sourced from here — never hardcoded.
 */
export const loadAiConfig = async (): Promise<AiAnswerConfig> => {
  const stored = await chrome.storage.local.get(AI_CONFIG_STORAGE_KEY)
  const raw = stored[AI_CONFIG_STORAGE_KEY]
  if (typeof raw !== 'object' || raw === null) {
    return DEFAULT_AI_ANSWER_CONFIG
  }
  return { ...DEFAULT_AI_ANSWER_CONFIG, ...(raw as Partial<AiAnswerConfig>) }
}

const joinUrl = (baseUrl: string, path: string): string => {
  const normalizedBase = baseUrl.replace(/\/+$/, '')
  const normalizedPath = path.replace(/^\/?/, '/')
  return `${normalizedBase}${normalizedPath}`
}

const sanitize = (value: string, maxLength: number): string => {
  const text = value.replace(/\s+/g, ' ').trim()
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}

const resolveAnswerCap = (maxLength?: number): number | undefined => {
  if (typeof maxLength !== 'number' || !Number.isFinite(maxLength)) {
    return undefined
  }
  if (maxLength <= 0) {
    return undefined
  }
  return Math.min(maxLength, ABSOLUTE_MAX_ANSWER_CHARS)
}

/**
 * Builds the chat messages for an open-text answer.
 */
const buildMessages = (context: AiAnswerContext): ChatMessage[] => {
  const cap = resolveAnswerCap(context.maxLength)
  const lengthRule = cap
    ? `Keep the answer under ${cap} characters.`
    : 'Keep the answer concise — a few short paragraphs at most.'

  const systemPrompt = [
    'You write first-person answers to open-ended questions on job application forms.',
    'Write only the answer text. Do not include preamble, labels, quotation marks, or markdown.',
    'Be specific and grounded in the supplied applicant summary and job context.',
    'Never invent facts (employers, dates, qualifications) that are not present in the applicant summary.',
    'Use a professional, sincere tone in the first person.',
    lengthRule,
  ].join('\n')

  const userPrompt = [
    'Question to answer:',
    sanitize(context.question, 2000),
    '',
    'Job context:',
    sanitize(context.jobContext, 4000) || '(none provided)',
    '',
    'Applicant summary (the only source of personal facts you may use):',
    sanitize(context.userProfile, 4000) || '(none provided)',
  ].join('\n')

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]
}

const extractContent = (data: ChatCompletionResponse): string => {
  const content = data.choices?.[0]?.message?.content
  if (typeof content === 'string') {
    return content.trim()
  }
  if (Array.isArray(content)) {
    return content
      .map((part) => part.text ?? part.content ?? '')
      .join('')
      .trim()
  }
  return ''
}

/**
 * Generates an open-text answer via the configured OpenAI-compatible provider.
 *
 * Throws when the feature is disabled, the API key is missing, or the request
 * fails — callers turn this into a graceful no-op for the user.
 */
export const generateAiAnswer = async (
  context: AiAnswerContext
): Promise<string> => {
  const config = await loadAiConfig()

  if (!config.enabled) {
    throw new Error('AI answer generation is disabled in settings.')
  }
  if (!config.apiKey.trim()) {
    throw new Error('No API key configured for AI answer generation.')
  }
  if (!config.baseUrl.trim() || !config.model.trim()) {
    throw new Error('AI endpoint or model is not configured.')
  }
  if (!context.question.trim()) {
    throw new Error('No question text to generate an answer for.')
  }

  const url = joinUrl(config.baseUrl, config.endpointPath)
  const messages = buildMessages(context)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: config.temperature,
      }),
    })

    const text = await response.text()
    if (!response.ok) {
      throw new Error(`AI request failed (${response.status}): ${text.slice(0, 300)}`)
    }

    let data: ChatCompletionResponse
    try {
      data = JSON.parse(text) as ChatCompletionResponse
    } catch {
      throw new Error('AI response was not valid JSON.')
    }

    const answer = extractContent(data)
    if (!answer) {
      throw new Error('AI response did not contain any answer text.')
    }
    return answer
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error))
  }
}
