import React, { FC, FormEvent, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'

import { HsCandidate } from '../../types'

const FEEDBACK_ENDPOINT = 'https://feedback-api.hiredsignal.com/feedback'

interface Props {
  open: boolean
  version: string
  tabUrl: string | null
  candidate: HsCandidate | null
  onClose: () => void
}

type SubmitState = 'idle' | 'sending' | 'sent'

export const HsFeedbackDialog: FC<Props> = ({
  open,
  version,
  tabUrl,
  candidate,
  onClose,
}) => {
  const [message, setMessage] = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [error, setError] = useState<string | null>(null)

  const close = () => {
    if (submitState === 'sending') return
    setMessage('')
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
          target: null,
          metadata: {
            kind: 'extension_feedback',
            surface: 'extension-popup',
            extension_version: version,
            candidate_email: candidate?.email ?? null,
            active_tab_url: tabUrl,
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
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={4}
            margin="dense"
            label="What is broken, confusing, or missing?"
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
