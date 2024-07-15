import React, { MouseEvent, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import SaveIcon from '@mui/icons-material/Save'
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
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
import MoreVertIcon from '@mui/icons-material/MoreVert'

import Logo from './components/Logo'

const theme = createTheme({
  typography: {
    fontSize: 12,
  }
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
    inputClass.hasAnswer().then(res => setHasAnswer(res))
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const popperOpen = Boolean(anchorEl)
  const popperId = popperOpen ? `menu-popper-${inputClass.uuid}` : undefined

  const openMoreInfo = (e: MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget)
  }
  const closeMoreInfo = () => {
    setAnchorEl(null)
  }

  /**
   * only close the popper when the more info button itself 
   * is clicked. Not when the popper body is clicked.
   */
  const handleMoreInfoClick = (e: MouseEvent<HTMLElement>) => {
    if (!popperOpen) {
      openMoreInfo(e)
    } else if (e.currentTarget.contains(e.target as Node)) {
      closeMoreInfo()
    }
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
                    <SaveIcon fontSize="small" />
                  </Button>
                </Tooltip>
                <Button type="button" onClick={handleMoreInfoClick}>
                  <MoreVertIcon fontSize="small" />
                  <Popper
                    id={popperId}
                    open={popperOpen}
                    anchorEl={anchorEl}
                    placement="right-start"
                    transition
                  >
                    {({ TransitionProps }) => (
                      <Fade {...TransitionProps} timeout={350}>
                        <Box mx={1}>
                          <Paper elevation={8}>
                            <Card>
                              <CardHeader
                                sx={{padding: 1}}
                                title="More Info"
                                action={
                                  <IconButton
                                    aria-label="close"
                                    onClick={closeMoreInfo}
                                    sx={{ marginLeft: 'auto' }}
                                  >
                                    <CloseIcon />
                                  </IconButton>
                                }
                              />
                              <CardContent sx={{padding: 0, paddingBottom: "0px!important"}}>
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
                                              <IconButton onClick={handleDeleteAnswer}>
                                                <DeleteIcon fontSize="inherit" />
                                              </IconButton>
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
                                        <TableCell variant="head">
                                          Current
                                        </TableCell>
                                        <TableCell>{currentValue}</TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </CardContent>
                            </Card>
                          </Paper>
                        </Box>
                      </Fade>
                    )}
                  </Popper>
                </Button>
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
