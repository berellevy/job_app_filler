import { createTheme } from "@mui/material";
import { teal } from "@mui/material/colors";
import { cloneElement, ReactElement } from "react";

const styleOverrides = {
  root: {
    class: "JAF-CUSTOM"
  }
}

const baseTheme = createTheme({})

export const theme = createTheme(baseTheme, {
  components: {
    MuiButtonBase: { styleOverrides },
    MuiButtonGroup: { styleOverrides },
    MuiContainer: { styleOverrides },
    MuiGrid: { styleOverrides },
    MuiGrid2: { styleOverrides },
    MuiPaper: { styleOverrides },
    MuiTypography: { styleOverrides },
    MuiAvatar: { styleOverrides },
  },
  typography: {
    allVariants: {
      color: teal[800],
    },
  },
  palette: {
    primary: {
      main: teal[600],
    },
    secondary: { main: teal[50] },
  },
})


export type JoinComponents = (componentArray: ReactElement[], joiner: ReactElement) => ReactElement[]

export const joinComponents: JoinComponents = (componentArray, joiner) => {
  return componentArray.reduce<ReactElement[]>((acc, curr, index) => {
    if (index > 0) {
      acc.push(cloneElement(joiner, { key: `separator-${index}` }))
    } 
    acc.push(curr)
    return acc
  }, [])
}