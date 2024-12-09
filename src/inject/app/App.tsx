import React, { FC } from 'react'
import { createRoot } from 'react-dom/client'

import { Box, Grid, ThemeProvider } from '@mui/material'
import { theme } from '@src/shared/utils/react'
import { ContextProvider } from './AppContext'

import { BaseFormInput } from './services/formFields/baseFormInput'
import { FieldWidgetButtons } from './FieldWidget/FieldWidgetButtons'
import Logo from '@src/shared/components/Logo'

const Main: FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Box my={'4px'}>
        <Grid container spacing={1} alignItems="center">
          <Grid item>
            <Logo />
          </Grid>
          <Grid item>
            <FieldWidgetButtons />
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
  createRoot(rootElement).render(app)
}
