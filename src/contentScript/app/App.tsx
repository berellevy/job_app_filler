/**
 * invisible app to show popups on the whole page.
 */
import {
  Box,
  Divider,
  ThemeProvider,
} from '@mui/material'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import React, { useState, useRef, useEffect, FC} from 'react'
import { createRoot } from 'react-dom/client'
import { v4 as uuid4 } from 'uuid'
import { releases, ReleaseComponent } from './Releases'
import { LogoTitleBar } from '@src/shared/components/LogoTitleBar'
import { theme, joinComponents } from '@src/shared/utils/react'



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
          <LogoTitleBar>
            What's New
          </LogoTitleBar>
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
            component={Box}
          >
            {joinComponents(
              releases.map((release, index) => {
                return (<ReleaseComponent key={index} release={release} />)
              }), <Divider sx={{ my: 1 }} />
            )}
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
