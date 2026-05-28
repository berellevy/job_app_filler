import React, { FC, useState } from 'react'
import { Box, Button, Link, Stack, Typography } from '@mui/material'
import { FeedbackIcon, GitHubIcon } from '@src/shared/utils/icons'

import { HsCandidate } from '../../types'
import { HsFeedbackDialog } from './HsFeedbackDialog'

interface Props {
  version: string
  tabId: number | null
  tabUrl: string | null
  candidate: HsCandidate | null
}

export const HsFooter: FC<Props> = ({ version, tabId, tabUrl, candidate }) => {
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  return (
    <>
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
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Button
              size="small"
              variant="text"
              startIcon={<FeedbackIcon sx={{ fontSize: 14 }} />}
              onClick={() => setFeedbackOpen(true)}
              sx={{ minWidth: 0, p: 0, fontSize: 12 }}
              aria-label="Send feedback about the HiredSignal extension"
            >
              Feedback
            </Button>
            <Link
              href="https://github.com/michaeltabet/hs-extension"
              target="_blank"
              rel="noopener noreferrer"
              variant="caption"
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
              aria-label="View HiredSignal extension on GitHub (opens in new tab)"
            >
              <GitHubIcon sx={{ fontSize: 14 }} />
              GitHub
            </Link>
          </Stack>
        </Stack>
      </Box>
      <HsFeedbackDialog
        open={feedbackOpen}
        version={version}
        tabId={tabId}
        tabUrl={tabUrl}
        candidate={candidate}
        onClose={() => setFeedbackOpen(false)}
      />
    </>
  )
}
