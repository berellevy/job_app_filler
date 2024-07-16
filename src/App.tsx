import React, { MouseEvent, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import SaveIcon from '@mui/icons-material/Save'
import InfoIcon from '@mui/icons-material/Info'
import DeleteIcon from '@mui/icons-material/Delete'

import {
  Card,
  CardHeader,
  CardContent,
  Box,
  IconButton,
  ButtonGroup,
  createTheme,
  Grid,
  Button,
  Paper,
  Typography,
  Tooltip,
  Popper,
  Fade,
  TableContainer,
  TableCell,
  Table,
  TableRow,
  TableBody,
} from '@mui/material'
import { BaseFormInput, SaveStatus } from './workday/baseFormInput'
import { ThemeProvider } from '@emotion/react'

import Logo from './components/Logo'
import { MoreInfoPopper } from './components/MoreInfoPopper'
import { ConfirmButton } from './components/ConfirmButton'

const theme = createTheme({
  typography: {
    // fontSize: 12,
  },
})

export const SaveButton: React.FC<{
  onClick?: () => Promise<void>
}> = ({ onClick }) => {
  return (
    <Box>
      <Paper>
        <Button size="small" onClick={onClick}>
          <Typography>Save</Typography>
        </Button>
      </Paper>
    </Box>
  )
}

export const FillButton: React.FC<{
  onClick?: () => void
  isFilled: boolean
}> = ({ onClick, isFilled }) => {
  return (
    <Box>
      <Paper>
        <Button
          size="small"
          onClick={onClick}
          color={isFilled ? 'success' : 'primary'}
          disabled={isFilled}
        >
          <Typography>{isFilled ? 'filled' : 'fill'}</Typography>
        </Button>
      </Paper>
    </Box>
  )
}

// TODO: render seperate react app in each subclass and pass the answer type as a generic
// but for now use any.
export const App: React.FC<{
  inputClass: BaseFormInput<any>
}> = ({ inputClass }) => {
  const [answer, setAnswer] = useState<any>(null)
  const [currentValue, setCurrentValue] = useState<any>(null)
  const [hasAnswer, setHasAnswer] = useState<boolean>(false)

  const refresh = () => {
    inputClass.hasAnswer().then((res) => setHasAnswer(res))
    inputClass.answer().then((res) => {
      setAnswer(res)
      setCurrentValue(inputClass.currentValue())
    })
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
              <ButtonGroup variant="contained" size="small">
                <Button onClick={handleFill}>Fill</Button>
                <Tooltip title="Save current value as answer.">
                  <Button onClick={handleSave}>
                    <SaveIcon sx={{fontSize: 14}} />
                  </Button>
                </Tooltip>
                <MoreInfoPopper title="More Info">
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell align="right" variant="head">
                            Answer
                          </TableCell>
                          <TableCell align="left">
                            {hasAnswer ? (
                              <Typography
                                component="div"
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                {answer}
                                <ConfirmButton
                                  component='IconButton'
                                  action={handleDeleteAnswer}
                                  dialogTitle="Are You Sure?"
                                  buttonContent={<DeleteIcon />}
                                >
                                  Are you Sure you want to delete this answer? 
                                  This action is not reversible.
                                </ConfirmButton>
                              </Typography>
                            ) : (
                              <Typography
                                component={'div'}
                                sx={{
                                  fontStyle: 'italic',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                No answer
                                <Tooltip title="Fill in the field and click save to save an answer">
                                  <InfoIcon
                                    sx={{ marginLeft: '4px' }}
                                    fontSize="inherit"
                                  />
                                </Tooltip>
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell variant="head">Current</TableCell>
                          <TableCell>{currentValue}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </MoreInfoPopper>
              </ButtonGroup>
            </Paper>
          </Grid>
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
  inputContainer.appendChild(rootElement)
  createRoot(rootElement).render(app)
}
