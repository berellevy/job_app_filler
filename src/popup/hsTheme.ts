import { createTheme } from '@mui/material'

/**
 * HiredSignal-specific MUI theme used inside the popup root only.
 *
 * We deliberately do NOT replace the shared `theme` exported from
 * `@src/shared/utils/react` because adapter code under `services/formFields`
 * still imports it. Wrapping the popup in its own ThemeProvider keeps the
 * brand visuals scoped to popup + in-page bar.
 */
export const HS_ACCENT = '#6366F1'
export const HS_ACCENT_DARK = '#4F46E5'
export const HS_NEUTRAL_BG = '#0F172A'
export const HS_NEUTRAL_FG = '#F8FAFC'
export const HS_NEUTRAL_MUTED = '#94A3B8'

export const hsTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: HS_ACCENT,
      dark: HS_ACCENT_DARK,
      contrastText: '#ffffff',
    },
    secondary: {
      main: HS_NEUTRAL_BG,
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily:
      '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
})
