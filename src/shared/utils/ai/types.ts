/**
 * Configuration for the OpenAI-compatible chat-completions endpoint used to
 * generate open-text answers. Persisted in `chrome.storage.local` under
 * {@link AI_CONFIG_STORAGE_KEY}. The API key is NEVER hardcoded — it is read
 * from storage at call time and validated before any network request.
 */
export interface AiAnswerConfig {
  /** Whether the AI open-text feature is turned on. */
  enabled: boolean
  /** Base URL of the OpenAI-compatible API, e.g. `https://api.openai.com/v1`. */
  baseUrl: string
  /** Endpoint path appended to {@link baseUrl}. */
  endpointPath: string
  /** Bearer API key. Stored locally only; empty string means "not configured". */
  apiKey: string
  /** Model identifier passed to the provider. */
  model: string
  /** Sampling temperature. */
  temperature: number
}

export const AI_CONFIG_STORAGE_KEY = 'aiAnswerConfig' as const

export const DEFAULT_AI_ANSWER_CONFIG: AiAnswerConfig = {
  enabled: false,
  baseUrl: 'https://api.openai.com/v1',
  endpointPath: '/chat/completions',
  apiKey: '',
  model: 'gpt-4o-mini',
  temperature: 0.4,
}

/** Background-SW message type for generating an open-text answer. */
export const AI_GENERATE_ANSWER_MESSAGE = 'AI_GENERATE_ANSWER' as const

/**
 * Minimal context the answer generator needs. All fields are caller-supplied;
 * the generator never infers personal data that is not provided here.
 */
export interface AiAnswerContext {
  /** The open-text question / prompt shown on the form. */
  question: string
  /** Free-text description of the job (title, company, JD snippets). */
  jobContext: string
  /** Free-text summary of the applicant the answer should be written for. */
  userProfile: string
  /** Optional soft character cap (e.g. derived from a maxlength attribute). */
  maxLength?: number
}

export interface AiGenerateAnswerRequest {
  type: typeof AI_GENERATE_ANSWER_MESSAGE
  context: AiAnswerContext
}

/**
 * Response from the background worker. A flat shape (rather than a
 * discriminated union) because this project's tsconfig is non-strict, where
 * boolean-literal union narrowing is unavailable. Read `ok` first; `answer` is
 * present on success and `error` on failure.
 */
export interface AiGenerateAnswerResponse {
  ok: boolean
  answer?: string
  error?: string
}

/** Type guard for the inbound background message. */
export const isAiGenerateAnswerRequest = (
  value: unknown
): value is AiGenerateAnswerRequest => {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const candidate = value as Record<string, unknown>
  if (candidate.type !== AI_GENERATE_ANSWER_MESSAGE) {
    return false
  }
  const context = candidate.context
  if (typeof context !== 'object' || context === null) {
    return false
  }
  const ctx = context as Record<string, unknown>
  return (
    typeof ctx.question === 'string' &&
    typeof ctx.jobContext === 'string' &&
    typeof ctx.userProfile === 'string'
  )
}
