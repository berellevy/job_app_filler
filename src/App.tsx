import React, { useEffect, useState } from 'react'
import ReactDOM, { createRoot } from 'react-dom/client'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { Box, createTheme, Grid, IconButton, Paper } from '@mui/material'
import { BaseFormInput, SaveStatus } from './workday/baseFormInput'
import RefreshIcon from '@mui/icons-material/Refresh'
import { ThemeProvider } from '@emotion/react'

const theme = createTheme({
  typography: {
    fontSize: 12,
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
  inputClass: BaseFormInput
}> = ({ inputClass }) => {
  const [answer, setAnswer] = useState<any>(null)
  const [currentValue, setCurrentValue] = useState<any>(null)
  const isFilled: boolean = answer === currentValue
  
  const refresh = () => {
    inputClass.answer().then((res) => {
      setAnswer(res)
      setCurrentValue(inputClass.currentValue())
    })

  }
  useEffect(() => {;
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

  return (
    <ThemeProvider theme={theme}>
      <Box my={'2px'}>
        <Grid container spacing={1} alignItems={'stretch'}>
          <Grid item>
            <SaveButton onClick={handleSave} />
          </Grid>
          <Grid item>
            <FillButton onClick={handleFill} isFilled={isFilled} />
          </Grid>
          <Grid item>
            <Paper>
              <IconButton size="small" onClick={refresh}>
                <RefreshIcon fontSize="inherit" />
              </IconButton>
            </Paper>
          </Grid>
          <Grid item textAlign={'center'}>
            <Paper>
              <Typography variant="body2">
                current value: {currentValue}
              </Typography>
              <Typography variant="body2">answer: {answer}</Typography>
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
