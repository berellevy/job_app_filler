import { createTheme } from "@mui/material";
import { teal } from "@mui/material/colors";



export const theme = createTheme({
  typography: {
    allVariants: {
        color: teal[800]
    },
  },
  palette: {
    primary: {
      main: teal[600],
    },
    secondary: {main: teal[50]},
  },
})