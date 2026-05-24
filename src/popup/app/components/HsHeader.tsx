import React, { FC } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { HS_ACCENT, HS_NEUTRAL_BG } from '../../hsTheme'

/**
 * Inline SVG logo so the popup stays self-contained (no extra asset round-trip).
 * Uses currentColor for the wordmark so we can theme via CSS.
 */
const HsLogoMark: FC<{ size?: number }> = ({ size = 28 }) => (
  <Box
    aria-hidden="true"
    sx={{
      width: size,
      height: size,
      borderRadius: '8px',
      background: `linear-gradient(135deg, ${HS_ACCENT} 0%, #8B5CF6 100%)`,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontWeight: 700,
      fontSize: size * 0.55,
      lineHeight: 1,
      letterSpacing: '-0.04em',
    }}
  >
    HS
  </Box>
)

export const HsHeader: FC = () => {
  return (
    <Box
      component="header"
      sx={{
        px: 2,
        py: 1.5,
        borderBottom: '1px solid #E2E8F0',
        background: '#ffffff',
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <HsLogoMark />
        <Typography
          variant="subtitle1"
          component="h1"
          sx={{ fontWeight: 700, color: HS_NEUTRAL_BG, m: 0 }}
        >
          HiredSignal Autofill
        </Typography>
      </Stack>
    </Box>
  )
}
