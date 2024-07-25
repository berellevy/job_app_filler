import React, { FC } from "react";
import "./popup.css"
import { AppBar, Box, Button, Container, Divider, IconButton, List, ListItem, ListItemIcon, ListItemText, ListSubheader, Toolbar, Typography } from "@mui/material";
import GitHubIcon from '@mui/icons-material/GitHub';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';


import { createRoot } from 'react-dom/client'
import { ThemeProvider } from "@emotion/react";
import { theme } from "../utils/react";
import Logo from "../components/Logo";
import { teal } from "@mui/material/colors";
const App: FC<{}> = () => {
  return (
    <ThemeProvider theme={theme}>
      <Box>
        <AppBar color="secondary" position="static">
          <Toolbar>
            <Box sx={{ mr: 2 }}>
              <Logo />
            </Box>
            <Typography
              color={teal[900]}
              variant="h5"
              component="div"
              sx={{ flexGrow: 1 }}
            >
              Job App Filler
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>
      <Box component={'main'}>
        <Container sx={{ my: 2 }}>
          <Typography variant="body1">
            Elevated autofill for annoying job sites.
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
            Feaures
          </Typography>
          <Typography mb={1}>Works. Well.</Typography>
          <Typography mb={1}>Completely free, No login required.</Typography>
          <Typography mb={1}>
            Your data is stored locally, on your browser and isn't sent{' '}
            <em>anywhere</em>.
          </Typography>
          <Box mt={1}>
            <Button
              target="_blank"
              href="https://github.com/berellevy/job_app_filler"
              startIcon={<GitHubIcon />}
              variant="outlined"
            >
              Contribute
            </Button>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  )
}


const rootel = document.createElement('div')
document.body.appendChild(rootel)

const root = createRoot(rootel)
root.render(<App />)