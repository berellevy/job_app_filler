import React, { FC, useState } from 'react'
import './popup.css'
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Snackbar,
  SnackbarCloseReason,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'

import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@emotion/react'
import { theme } from '../utils/react'
import { ContentCopyIcon, GitHubIcon, OpenInNewIcon } from '../utils/icons'
import { LogoTitleBar } from '../components/LogoTitleBar'

const EMAIL_ADDRESS = 'berellevy+chromeextensions@gmail.com'

const App: FC<{}> = () => {
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false)
  const [snackbarMessage, setSnackbarMessage] = useState<string>('')
  const handleCloseSnackbar = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    setSnackbarOpen(false)
  }

  return (
    <ThemeProvider theme={theme}>
      <Box pb={'1em'}>
        <LogoTitleBar>Job App Filler</LogoTitleBar>
      </Box>
      <Box component={'main'}>
        <Container sx={{ my: 2 }}>
          <Typography variant="h6" sx={{mb: 1}}>
            The Best Autofill Since Sliced Bread.
          </Typography>
          <Stack direction={'row'} spacing={1}>
            <Button
              variant="outlined"
              onClick={() => {
                chrome.tabs.query(
                  { active: true, currentWindow: true },
                  (tabs) => {
                    chrome.tabs
                      .sendMessage(tabs[0].id, {
                        type: 'SHOW_WHATS_NEW',
                      })
                      .catch((err) => {
                        setSnackbarMessage('Only works on workday sites.')
                        setSnackbarOpen(true)
                      }),
                      () => {}
                  }
                )
              }}
            >
              what's new?
            </Button>
            <Button
              variant="outlined"
              href="https://youtu.be/JYMATq9siIY"
              target="_blank"
              endIcon={<OpenInNewIcon />}
            >
              Tutorial
            </Button>
          </Stack>
          <Divider sx={{ my: 2 }} />

          <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
            Feaures
          </Typography>
          <Typography mb={1}>Works. Well.</Typography>
          <Typography mb={1}>Completely free, No login required.</Typography>
          <Typography mb={1}>
            Your data is stored locally, on your browser and isn't sent{' '}
            <em>anywhere</em>.
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Box my={1}>
            <Button
              target="_blank"
              href="https://github.com/berellevy/job_app_filler"
              startIcon={<GitHubIcon />}
              variant="outlined"
            >
              Contribute
            </Button>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Tooltip title={EMAIL_ADDRESS}>
              <Button
                href={'mailto:' + EMAIL_ADDRESS}
                size="small"
                variant="text"
                target="_blank"
              >
                Contact
              </Button>
            </Tooltip>
            <Tooltip title="Copy email address">
              <IconButton
                size={'small'}
                onClick={() => {
                  navigator.clipboard.writeText(EMAIL_ADDRESS)
                  setSnackbarMessage('Copied.')
                  setSnackbarOpen(true)
                }}
              >
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Container>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={2000}
          onClose={handleCloseSnackbar}
          message={snackbarMessage}
        />
      </Box>
    </ThemeProvider>
  )
}

const rootel = document.createElement('div')
document.body.appendChild(rootel)

const root = createRoot(rootel)
root.render(<App />)
