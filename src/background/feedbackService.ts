import {
  FeedbackSubmission,
  FeedbackSubmitResponse,
} from '@src/shared/utils/feedback/messages'

const FEEDBACK_API_BASE = (
  process.env.HS_FEEDBACK_API_BASE || 'https://feedback-api.hiredsignal.com'
).replace(/\/+$/, '')

const FEEDBACK_ENDPOINT = `${FEEDBACK_API_BASE}/feedback`

export async function submitFeedback(
  payload: FeedbackSubmission
): Promise<FeedbackSubmitResponse> {
  const response = await fetch(FEEDBACK_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    return {
      ok: false,
      error: `Feedback service returned HTTP ${response.status}`,
    }
  }

  const body = await response.json().catch(() => null) as { id?: unknown } | null
  return {
    ok: true,
    id: typeof body?.id === 'number' ? body.id : undefined,
  }
}
