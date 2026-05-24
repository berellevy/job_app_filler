import React, { FC, FormEvent, useRef, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { OpenInNewIcon } from '@src/shared/utils/icons'
import { HsCandidate, sendHsMessage } from '../../types'

const TOKEN_HELP_URL = 'https://hiredsignal.com/account/api-tokens'

interface Props {
  hasPat: boolean
  candidate: HsCandidate | null
  candidateError: string | null
  onAuthChanged: () => void
}

export const HsAuthSection: FC<Props> = ({
  hasPat,
  candidate,
  candidateError,
  onAuthChanged,
}) => {
  const [patInput, setPatInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const patFieldRef = useRef<HTMLInputElement | null>(null)

  const onSavePat = async (e: FormEvent) => {
    e.preventDefault()
    const trimmed = patInput.trim()
    if (!trimmed) {
      setError('Please paste a Personal Access Token.')
      patFieldRef.current?.focus()
      return
    }
    setSaving(true)
    setError(null)
    const res = await sendHsMessage<{ ok: true }>({
      type: 'HS_AUTH_SET_PAT',
      pat: trimmed,
    })
    setSaving(false)
    if (!res.ok) {
      setError(res.error.message)
      patFieldRef.current?.focus()
      return
    }
    setPatInput('')
    onAuthChanged()
  }

  const onSignOut = async () => {
    setSaving(true)
    setError(null)
    const res = await sendHsMessage<{ ok: true }>({ type: 'HS_AUTH_CLEAR' })
    setSaving(false)
    if (!res.ok) {
      setError(res.error.message)
      return
    }
    onAuthChanged()
  }

  if (!hasPat) {
    return (
      <Box
        component="section"
        aria-labelledby="hs-auth-heading"
        sx={{ px: 2, py: 2 }}
      >
        <Typography
          id="hs-auth-heading"
          variant="subtitle2"
          component="h2"
          sx={{ mb: 1, fontWeight: 600 }}
        >
          Connect to HiredSignal
        </Typography>
        <Typography variant="body2" sx={{ mb: 1.5, color: '#475569' }}>
          Paste a Personal Access Token to fetch your tailored CV and candidate
          answers automatically.
        </Typography>
        <Box component="form" onSubmit={onSavePat} noValidate>
          <Stack spacing={1.25}>
            <TextField
              inputRef={patFieldRef}
              autoFocus
              fullWidth
              size="small"
              type="password"
              label="Personal Access Token"
              value={patInput}
              onChange={(e) => setPatInput(e.target.value)}
              inputProps={{
                'aria-label': 'HiredSignal Personal Access Token',
                'aria-describedby': error ? 'hs-pat-error' : undefined,
              }}
              disabled={saving}
            />
            {error ? (
              <Alert
                id="hs-pat-error"
                severity="error"
                role="alert"
                sx={{ py: 0 }}
              >
                {error}
              </Alert>
            ) : null}
            <Stack
              direction="row"
              spacing={1}
              justifyContent="space-between"
              alignItems="center"
            >
              <Link
                href={TOKEN_HELP_URL}
                target="_blank"
                rel="noopener noreferrer"
                variant="caption"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
                aria-label="Get a HiredSignal Personal Access Token (opens in new tab)"
              >
                Get a token
                <OpenInNewIcon sx={{ fontSize: 14 }} />
              </Link>
              <Button
                type="submit"
                variant="contained"
                size="small"
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save PAT'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      component="section"
      aria-labelledby="hs-account-heading"
      sx={{ px: 2, py: 2 }}
    >
      <Typography
        id="hs-account-heading"
        variant="subtitle2"
        component="h2"
        sx={{ mb: 0.5, fontWeight: 600 }}
      >
        Account
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          {candidate ? (
            <Typography variant="body2" sx={{ color: '#0F172A' }}>
              Connected as <strong>{candidate.email}</strong>
            </Typography>
          ) : candidateError ? (
            <Typography variant="body2" sx={{ color: '#B91C1C' }} role="alert">
              {candidateError}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ color: '#475569' }}>
              Loading account…
            </Typography>
          )}
        </Box>
        <Button
          variant="outlined"
          size="small"
          onClick={onSignOut}
          disabled={saving}
          aria-label="Sign out and clear stored token"
        >
          {saving ? 'Signing out…' : 'Sign out'}
        </Button>
      </Stack>
      {error ? (
        <Alert severity="error" role="alert" sx={{ mt: 1, py: 0 }}>
          {error}
        </Alert>
      ) : null}
    </Box>
  )
}
