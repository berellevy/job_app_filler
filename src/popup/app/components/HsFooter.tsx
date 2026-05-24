import React, { FC } from 'react'
import { Box, Link, Stack, Typography } from '@mui/material'
import { GitHubIcon } from '@src/shared/utils/icons'

interface Props {
  version: string
}

export const HsFooter: FC<Props> = ({ version }) => {
  return (
    <Box
      component="footer"
      sx={{
        px: 2,
        py: 1.25,
        borderTop: '1px solid #E2E8F0',
        background: '#F8FAFC',
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="caption" sx={{ color: '#64748B' }}>
          v{version}
        </Typography>
        <Link
          href="https://github.com/michaeltabet/hs-extension"
          target="_blank"
          rel="noopener noreferrer"
          variant="caption"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
          aria-label="View HiredSignal extension on GitHub (opens in new tab)"
        >
          <GitHubIcon sx={{ fontSize: 14 }} />
          View on GitHub
        </Link>
      </Stack>
    </Box>
  )
}
