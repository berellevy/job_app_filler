import React, { FC } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material'
import { CloseIcon, AutoFixHighIcon } from '@src/shared/utils/icons'

/**
 * Local accent + neutral colors — kept self-contained so the in-page bar
 * doesn't depend on the popup-only theme module.
 */
const HS_ACCENT = '#6366F1'
const HS_NEUTRAL_BG = '#0F172A'
const HS_NEUTRAL_FG = '#F8FAFC'

const inPageTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: HS_ACCENT, contrastText: '#ffffff' },
    background: { paper: HS_NEUTRAL_BG, default: HS_NEUTRAL_BG },
    text: { primary: HS_NEUTRAL_FG, secondary: '#CBD5E1' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
  },
})

export type HsBarState =
  | { kind: 'detecting' }
  | { kind: 'matched'; label: string }
  | { kind: 'filling'; progress: number }
  | { kind: 'done' }
  | { kind: 'no-match' }
  | { kind: 'error'; message: string }

interface Props {
  state: HsBarState
  onFill: () => void
  onDismiss: () => void
}

const stateLabel = (state: HsBarState): string => {
  switch (state.kind) {
    case 'detecting':
      return 'Detecting HiredSignal job…'
    case 'matched':
      return `Matched: ${state.label}`
    case 'filling':
      return `Filling… ${Math.round(state.progress * 100)}%`
    case 'done':
      return 'Done — review and submit'
    case 'no-match':
      return 'No matching HiredSignal job — open the extension to configure.'
    case 'error':
      return `HiredSignal error: ${state.message}`
  }
}

export const HsAutofillBar: FC<Props> = ({ state, onFill, onDismiss }) => {
  return (
    <ThemeProvider theme={inPageTheme}>
      <Box
        role="region"
        aria-label="HiredSignal autofill bar"
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 2147483600,
          minWidth: 320,
          maxWidth: 420,
          px: 2,
          py: 1.25,
          borderRadius: 3,
          background: HS_NEUTRAL_BG,
          color: HS_NEUTRAL_FG,
          boxShadow: '0 10px 40px rgba(15, 23, 42, 0.35)',
          border: `1px solid rgba(99, 102, 241, 0.35)`,
          fontFamily:
            '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            aria-hidden="true"
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1.5,
              background: `linear-gradient(135deg, ${HS_ACCENT} 0%, #8B5CF6 100%)`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: '-0.04em',
              flexShrink: 0,
            }}
          >
            HS
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{ color: '#94A3B8', display: 'block', lineHeight: 1 }}
            >
              HiredSignal Autofill
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: HS_NEUTRAL_FG,
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              aria-live="polite"
            >
              {stateLabel(state)}
            </Typography>
          </Box>

          {state.kind === 'matched' ? (
            <Button
              variant="contained"
              size="small"
              onClick={onFill}
              startIcon={<AutoFixHighIcon fontSize="small" />}
              aria-label="Fill this form with HiredSignal answers"
            >
              Fill with HiredSignal
            </Button>
          ) : null}

          {state.kind === 'filling' ? (
            <CircularProgress
              size={20}
              sx={{ color: HS_ACCENT }}
              aria-label="Filling form"
            />
          ) : null}

          <IconButton
            size="small"
            onClick={onDismiss}
            aria-label="Dismiss HiredSignal autofill bar"
            sx={{ color: '#94A3B8' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
    </ThemeProvider>
  )
}

