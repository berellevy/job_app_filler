import React, { FC, FormEvent, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'

import { FeedbackKind } from '@src/shared/utils/feedback/messages'

import { HsCandidate } from '../../types'

const FEEDBACK_API_BASE = (
  process.env.HS_FEEDBACK_API_BASE || 'https://feedback-api.hiredsignal.com'
).replace(/\/+$/, '')
const FEEDBACK_ENDPOINT = `${FEEDBACK_API_BASE}/feedback`

interface Props {
  open: boolean
  version: string
  tabId: number | null
  tabUrl: string | null
  candidate: HsCandidate | null
  onClose: () => void
}

type SubmitState = 'idle' | 'sending' | 'sent'

export const HsFeedbackDialog: FC<Props> = ({
  open,
  version,
  tabId,
  tabUrl,
  candidate,
  onClose,
}) => {
  const [message, setMessage] = useState('')
  const [kind, setKind] = useState<FeedbackKind>('general')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [error, setError] = useState<string | null>(null)

  const startPagePicker = () => {
    if (tabId === null) {
      setError('Open a supported application page before reporting a page problem.')
      return
    }

    setSubmitState('sending')
    setError(null)

    try {
      chrome.tabs.sendMessage(
        tabId,
        {
          type: 'HS_START_FEEDBACK_PICK',
          version,
          candidateEmail: candidate?.email ?? null,
        },
        (response?: { ok?: boolean }) => {
          const transportErr = chrome.runtime.lastError
          if (transportErr || !response?.ok) {
            setSubmitState('idle')
            setKind('general')
            setError(
              transportErr?.message ||
                'Could not start page picker on this tab.'
            )
            return
          }

          chrome.tabs.update(tabId, { active: true })
          chrome.windows.getCurrent({}, (win) => {
            if (typeof win?.id === 'number') {
              chrome.windows.update(win.id, { focused: true })
            }
            window.close()
          })
        }
      )
    } catch (err) {
      setSubmitState('idle')
      setKind('general')
      setError(err instanceof Error ? err.message : 'Could not start page picker.')
    }
  }

  const close = () => {
    if (submitState === 'sending') return
    setMessage('')
    setKind('general')
    setError(null)
    setSubmitState('idle')
    onClose()
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = message.trim()
    if (trimmed.length < 3) {
      setError('Please write at least a few words.')
      return
    }

    setSubmitState('sending')
    setError(null)

    try {
      const response = await fetch(FEEDBACK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          userId: null,
          email: candidate?.email ?? null,
          url: tabUrl,
          target: kind === 'pick'
            ? {
                selector: 'extension-popup current-tab',
                text: tabUrl ?? 'No active tab URL',
                rect: null,
              }
            : null,
          metadata: {
            kind,
            surface: 'extension-popup',
            source: 'chrome-extension',
            extension_version: version,
            candidate_email: candidate?.email ?? null,
            active_tab_url: tabUrl,
            feedback_api_base: FEEDBACK_API_BASE,
          },
        }),
      })
      if (!response.ok) {
        throw new Error(`Feedback service returned HTTP ${response.status}`)
      }
      setSubmitState('sent')
      setMessage('')
      window.setTimeout(close, 900)
    } catch (err) {
      setSubmitState('idle')
      setError(err instanceof Error ? err.message : 'Could not send feedback.')
    }
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      maxWidth="xs"
      aria-labelledby="hs-feedback-title"
    >
      <Box component="form" onSubmit={onSubmit}>
        <DialogTitle id="hs-feedback-title">Send feedback</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ mb: 1.5 }}>
            <Typography variant="body2" sx={{ color: '#475569' }}>
              Tell us what's broken, confusing, or missing.
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              size="small"
              value={kind}
              onChange={(_, nextKind: FeedbackKind | null) => {
                if (!nextKind) return
                if (nextKind === 'pick') {
                  setKind(nextKind)
                  startPagePicker()
                  return
                }
                setKind(nextKind)
              }}
              aria-label="Feedback type"
            >
              <ToggleButton value="pick" aria-label="Current page problem">
                Page
              </ToggleButton>
              <ToggleButton value="bad_ai_response" aria-label="Bad AI response">
                Bad AI
              </ToggleButton>
              <ToggleButton value="general" aria-label="General feedback">
                General
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={4}
            margin="dense"
            label={kind === 'bad_ai_response'
              ? 'What did the AI get wrong?'
              : kind === 'pick'
                ? 'What is broken on this page?'
                : 'What is broken, confusing, or missing?'}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={submitState === 'sending' || submitState === 'sent'}
            inputProps={{ maxLength: 5000 }}
          />
          {error ? (
            <Alert severity="error" role="alert" sx={{ mt: 1 }}>
              {error}
            </Alert>
          ) : null}
          {submitState === 'sent' ? (
            <Alert severity="success" role="status" sx={{ mt: 1 }}>
              Thanks — feedback received.
            </Alert>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button
            type="button"
            onClick={close}
            disabled={submitState === 'sending'}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitState === 'sending' || submitState === 'sent'}
          >
            {submitState === 'sending' ? 'Sending…' : 'Send'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
