import React, { Children, cloneElement, FC, ReactElement, ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'


import {
  Box,
  ButtonGroup,
  Grid,
  Button,
  Paper,
  Tooltip,
  ThemeProvider,
  GlobalStyles,
  Portal,
} from '@mui/material'
import { BaseFormInput } from './formFields/baseFormInput'

import Logo from './components/Logo'
import { MoreInfoPopper } from './components/MoreInfoPopper'
import { MoreInfoContent } from './components/MoreInfoContent'
import { theme } from './utils/react'
import { ButtonSuccessBadge } from './components/ButtonSuccessBadge'
import { useAppContext, ContextProvider, } from './AppContext'
import { AutoFixHighIcon, SaveIcon } from './utils/icons'


// TODO: render seperate react app in each subclass and pass the answer type as a generic
// but for now use any.


const Main: FC = () => {
  const appContext = useAppContext()
  const {
    backend,
    fillButtonState,
    isFilled,
    moreInfoPopper,
    saveButtonClickHandler,
    editableAnswerState
  } = appContext

  const {answers} = editableAnswerState
  

  
  return (

    <ThemeProvider theme={theme}>
      <Box my={'4px'}>
        <Grid container spacing={1} alignItems="center">
          <Grid item>
            <Logo />
          </Grid>
          <Grid item>
            <Paper elevation={4}>
              <ButtonGroup ref={moreInfoPopper.anchorRef} size="small">
                <Tooltip title="Autofill" placement="top" arrow>
                  <span>
                    <ButtonSuccessBadge show={answers.length > 0 && isFilled}>
                      <Button
                        onClick={fillButtonState.onClick}
                        disabled={fillButtonState.isDisabled}
                      >
                        <AutoFixHighIcon />
                      </Button>
                    </ButtonSuccessBadge>
                  </span>
                </Tooltip>
                <ButtonSuccessBadge show={answers.length > 0}>
                  <Tooltip
                    title="Save current value as answer."
                    placement="top"
                    arrow
                  >
                    <Button onClick={() => saveButtonClickHandler(backend.fieldSnapshot, appContext)}>
                      <SaveIcon />
                    </Button>
                  </Tooltip>
                </ButtonSuccessBadge>
                <MoreInfoPopper title="More Info">
                  <MoreInfoContent />
                </MoreInfoPopper>
              </ButtonGroup>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  )
}


export const App: React.FC<{
  backend: BaseFormInput<any>
}> = ({ backend }) => {
  
  return (
    <ContextProvider backend={backend}>
      <Main />
    </ContextProvider>
  )
}

export const attachReactApp = (
  app: React.ReactNode,
  inputContainer: HTMLElement
) => {
  // cant just append the react app to the root element...
  // it makes the element disappear
  const rootElement = document.createElement('div')
  inputContainer.insertBefore(rootElement, inputContainer.lastChild)
  // inputContainer.appendChild(rootElement)
  createRoot(rootElement).render(app)
}
