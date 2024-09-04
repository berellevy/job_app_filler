/**
 * invisible app to show popups on the whole page.
 */
import {
  AppBar,
  Box,
  Divider,
  Paper,
  ThemeProvider,
  Toolbar,
  Typography,
} from '@mui/material'
import Button from '@mui/material/Button'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import React, { useState, useRef, useEffect, FC } from 'react'
import { createRoot } from 'react-dom/client'
import { v4 as uuid4 } from 'uuid'
import Logo from '../components/Logo'
import { teal } from '@mui/material/colors'
import { theme } from '../utils/react'

export const EVENT_LISTENER_ID: string = uuid4()

const ContentApp: FC = () => {
  useEffect(() => {
    document.addEventListener(EVENT_LISTENER_ID, () => {
      setOpen(true)
    })
  })
  const [open, setOpen] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  const descriptionElementRef = useRef<HTMLElement>(null)
  useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef
      if (descriptionElement !== null) {
        descriptionElement.focus()
      }
    }
  }, [open])

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={open}
        onClose={handleClose}
        scroll={'paper'}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title" sx={{ p: 1 }}>
        <AppBar color="secondary" position="static">
            <Toolbar>
              <Box sx={{ mr: 2 }}>
                <Logo />
              </Box>
              <Typography
                color={teal[900]}
                variant="h5"
                component="div"
                sx={{ flexGrow: 1 }}
              >
                What's New
              </Typography>
            </Toolbar>
          </AppBar>
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
            component={Box}
          >
            <Typography variant="h6">1.0.7 - 9/4/24</Typography>
            <Typography>
              Autofill: Vastly improved answer management UI. Edit stored questions and answers.
              Advanced answer matching.
            </Typography>
              Bug fixes.
            <Typography>

            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6">1.0.6 - 8/9/24</Typography>
            <Typography>
              Workday Fields: Year input and field of study (in education), yes/no radio.
            </Typography>
            <Typography>
              Autofill: Ability to add backup answers to single dropdowns (searchable as well).
            </Typography>
            <Typography>

              Popup: Contact button. 'What's New' dialog (that's me!).
            </Typography>

            <Divider sx={{ my: 1 }} />
            <Typography variant="h6">1.0.5 - 8/4/24</Typography>
            <Typography>
              Workday Fields: single checkbox, month & year. Try it out on Work
              Experience!
              <br />
              UI: Added badges for saved and filled.
            </Typography>

            <Divider sx={{ my: 1 }} />
            <Typography variant="h6">1.0.4 - 7/31/24</Typography>
            <Typography>
              Add searchable dropdown field. Fix ui syncing issue.
            </Typography>

            <Divider sx={{ my: 1 }} />
            <Typography variant="h6">1.0.3 - 7/25/24</Typography>
            <Typography>Added support for simple dropdown fields.</Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  )
}

export const loadApp = () => {
  const rootel = document.createElement('div')
  document.body.appendChild(rootel)

  const root = createRoot(rootel)
  root.render(<ContentApp />)
}
