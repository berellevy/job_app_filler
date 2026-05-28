import { FeedbackTarget } from './pageTarget'

export type FeedbackKind = 'pick' | 'bad_ai_response' | 'general'

export interface FeedbackSubmission {
  message: string
  userId: string | null
  email: string | null
  url: string | null
  target: FeedbackTarget | null
  metadata: Record<string, unknown>
}

export type FeedbackRuntimeMessage =
  | {
      type: 'HS_FEEDBACK_SUBMIT'
      payload: FeedbackSubmission
    }
  | {
      type: 'HS_START_FEEDBACK_PICK'
      version: string
      candidateEmail: string | null
    }

export interface FeedbackSubmitResponse {
  ok: boolean
  id?: number
  error?: string
}

export function isFeedbackSubmitMessage(v: unknown): v is Extract<FeedbackRuntimeMessage, { type: 'HS_FEEDBACK_SUBMIT' }> {
  if (typeof v !== 'object' || v === null) return false
  const msg = v as { type?: unknown; payload?: unknown }
  if (msg.type !== 'HS_FEEDBACK_SUBMIT') return false
  const payload = msg.payload as { message?: unknown } | undefined
  return typeof payload?.message === 'string'
}

export function isStartFeedbackPickMessage(v: unknown): v is Extract<FeedbackRuntimeMessage, { type: 'HS_START_FEEDBACK_PICK' }> {
  if (typeof v !== 'object' || v === null) return false
  const msg = v as { type?: unknown; version?: unknown; candidateEmail?: unknown }
  return (
    msg.type === 'HS_START_FEEDBACK_PICK' &&
    typeof msg.version === 'string' &&
    (typeof msg.candidateEmail === 'string' || msg.candidateEmail === null)
  )
}
