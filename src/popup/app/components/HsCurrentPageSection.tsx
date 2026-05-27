import React, { FC } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material'
import { OpenInNewIcon } from '@src/shared/utils/icons'
import { HsJobMatch } from '../../types'

const SUPPORTED_HOST_FRAGMENTS = [
  'myworkdayjobs.com',
  'myworkdaysite.com',
  'greenhouse.io',
  'lever.co',
  'ashbyhq.com',
  'smartrecruiters.com',
  'workable.com',
  'icims.com',
]

export const isSupportedAtsUrl = (url: string | undefined | null): boolean => {
  if (!url) return false
  try {
    const host = new URL(url).host.toLowerCase()
    return SUPPORTED_HOST_FRAGMENTS.some((frag) => host.endsWith(frag))
  } catch {
    return false
  }
}

interface Props {
  /** undefined => still detecting; null => no match found; object => matched */
  match: HsJobMatch | null | undefined
  /** Error from background while resolving the match, if any. */
  error: string | null
  /** Currently active tab URL (may be undefined while loading). */
  tabUrl: string | null
  /** True if the popup is currently focused on a supported ATS tab. */
  supported: boolean
  /** Re-trigger detection. */
  onRefresh: () => void
  /** Focus the active tab on the matched form (best-effort). */
  onOpenForm: () => void
}

export const HsCurrentPageSection: FC<Props> = ({
  match,
  error,
  supported,
  onRefresh,
  onOpenForm,
}) => {
  const title =
    match?.slug || [match?.company, match?.role].filter(Boolean).join(' — ')
  const cvLabel =
    match?.cvName || (match?.cvMaterialId ? 'Ready' : 'Not found')

  return (
    <Box
      component="section"
      aria-labelledby="hs-page-heading"
      sx={{
        px: 2,
        py: 2,
        borderTop: '1px solid #E2E8F0',
      }}
    >
      <Typography
        id="hs-page-heading"
        variant="subtitle2"
        component="h2"
        sx={{ mb: 1, fontWeight: 600 }}
      >
        Current page
      </Typography>

      {!supported ? (
        <Typography variant="body2" sx={{ color: '#475569' }}>
          Open a supported application page to use autofill.
        </Typography>
      ) : error ? (
        <Stack spacing={1}>
          <Typography variant="body2" role="alert" sx={{ color: '#B91C1C' }}>
            {error}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={onRefresh}
            aria-label="Retry detection"
          >
            Retry
          </Button>
        </Stack>
      ) : match === undefined ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={16} aria-hidden="true" />
          <Typography variant="body2" sx={{ color: '#475569' }}>
            Detecting…
          </Typography>
        </Stack>
      ) : match === null ? (
        <Typography variant="body2" sx={{ color: '#475569' }}>
          No HiredSignal job found for this URL — save it in HiredSignal first.
        </Typography>
      ) : (
        <Stack spacing={1}>
          <Box>
            <Typography
              variant="body2"
              sx={{ color: '#0F172A', fontWeight: 600 }}
            >
              Matched: {title || 'Tracked job'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#475569' }}>
              CV: {cvLabel}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="contained"
              onClick={onOpenForm}
              endIcon={<OpenInNewIcon />}
              aria-label={`Open application form for ${title || 'tracked job'}`}
            >
              Open form
            </Button>
            <Button
              size="small"
              variant="text"
              onClick={onRefresh}
              aria-label="Re-detect match"
            >
              Refresh
            </Button>
          </Stack>
        </Stack>
      )}
    </Box>
  )
}
