import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import SaveIcon from '@mui/icons-material/Save'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

import {
  Box,
  ButtonGroup,
  Grid,
  Button,
  Paper,
  Tooltip,
  ThemeProvider,
  Zoom,
  Fade,
} from '@mui/material'
import { BaseFormInput } from './formFields/baseFormInput'

import Logo from './components/Logo'
import { MoreInfoPopper } from './components/MoreInfoPopper'
import { MoreInfoContent } from './components/MoreInfoContent'
import { theme } from './utils/react'
import ErrorIcon from '@mui/icons-material/Error'

// TODO: render seperate react app in each subclass and pass the answer type as a generic
// but for now use any.
export const App: React.FC<{
  inputClass: BaseFormInput<any>
}> = ({ inputClass }) => {
  const [answer, setAnswer] = useState<any>(null)
  const [currentValue, setCurrentValue] = useState<any>(null)
  const [hasAnswer, setHasAnswer] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = () => {
    inputClass.hasAnswer().then((res) => {
      setHasAnswer(res)
    })
    inputClass.answer().then((res) => {
      setAnswer(res)
      setCurrentValue(inputClass.currentValue())
    })
    setError(inputClass.error)
  }

  useEffect(() => {
    inputClass.fill().then(() => setTimeout(refresh, 0))
    inputClass.element.addEventListener(inputClass.reactMessageEventId, refresh)

    return () => {
      inputClass.element.removeEventListener(
        inputClass.reactMessageEventId,
        refresh
      )
    }
  }, [])

  const handleSave = async () => {
    const result: boolean = await inputClass.save()
    if (result) {
      refresh()
    }
  }

  const handleFill = async () => {
    await inputClass.fill()
    refresh()
  }

  const handleDeleteAnswer = async () => {
    await inputClass.deleteAnswer()
    refresh()
  }

  return (
    <ThemeProvider theme={theme}>
      <Box my={'4px'}>
        <Grid container spacing={1} alignItems="center">
          <Grid item>
            <Logo />
          </Grid>
          <Grid item>
            <Paper elevation={4}>
              <ButtonGroup size="small">
                <Tooltip title="Autofill">
                  <Button onClick={handleFill}>
                    <AutoFixHighIcon />
                  </Button>
                </Tooltip>
                <Tooltip title="Save current value as answer.">
                  <Button onClick={handleSave}>
                    <SaveIcon />
                  </Button>
                </Tooltip>
                <MoreInfoPopper title="More Info">
                  <MoreInfoContent
                    answer={answer}
                    currentValue={currentValue}
                    handleDeleteAnswer={handleDeleteAnswer}
                    hasAnswer={hasAnswer}
                  />
                </MoreInfoPopper>
              </ButtonGroup>
            </Paper>
          </Grid>
          <Fade in={Boolean(error)}>
            <Grid item>
              <Tooltip title={error} TransitionComponent={Zoom}>
                <ErrorIcon color="error" />
              </Tooltip>
            </Grid>
          </Fade>
        </Grid>
      </Box>
    </ThemeProvider>
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
