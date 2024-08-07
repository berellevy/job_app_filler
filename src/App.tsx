import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import SaveIcon from '@mui/icons-material/Save'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'

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
import { ButtonSuccessBadge } from './components/ButtonSuccessBadge'
import { Answer, FieldPath } from './utils/types'

// TODO: render seperate react app in each subclass and pass the answer type as a generic
// but for now use any.
export const App: React.FC<{
  backend: BaseFormInput<any>
}> = ({ backend }) => {
  const [answer, setAnswer] = useState<Answer>({
    answer: null,
    hasAnswer: false,
    path: { page: null, section: null, fieldName: null, fieldType: null },
  })
  const [currentValue, setCurrentValue] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isFilled, setIsFilled] = useState<boolean>(false)
  const [fillButtonDisabled, setFillButtonDisabled] = useState<boolean>(false)

  const refresh = async () => {
    const answer = await backend.answer()
    setAnswer(answer)
    setCurrentValue(backend.currentValue())
    setIsFilled(await backend.isFilled(answer))
    setError(backend.error)
  }

  useEffect(() => {
    ;(async () => {
      await handleFill()
    })()
    backend.element.addEventListener(backend.reactMessageEventId, refresh)

    return () => {
      backend.element.removeEventListener(backend.reactMessageEventId, refresh)
    }
  }, [])

  const handleSave = async () => {
    const result: boolean = await backend.save()
    if (result) {
      await refresh()
    }
  }

  const handleFill = async () => {
    setFillButtonDisabled(true)
    await backend.fill()
    await refresh()
    setFillButtonDisabled(false)
  }

  const handleDeleteAnswer = async () => {
    await backend.deleteAnswer()
    await refresh()
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
                <Tooltip title="Autofill" placement="top" arrow>
                  <span>
                    <ButtonSuccessBadge show={answer.hasAnswer && isFilled}>
                      <Button
                        onClick={handleFill}
                        disabled={fillButtonDisabled}
                      >
                        <AutoFixHighIcon />
                      </Button>
                    </ButtonSuccessBadge>
                  </span>
                </Tooltip>
                <ButtonSuccessBadge show={answer.hasAnswer}>
                  <Tooltip
                    title="Save current value as answer."
                    placement="top"
                    arrow
                  >
                    <Button onClick={handleSave}>
                      <SaveIcon />
                    </Button>
                  </Tooltip>
                </ButtonSuccessBadge>
                <MoreInfoPopper title="More Info">
                  <MoreInfoContent
                    backend={backend}
                    answerDisplayType={backend.answerDisplayType}
                    answer={answer}
                    currentValue={currentValue}
                    handleDeleteAnswer={handleDeleteAnswer}
                    path={backend.path}
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
