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
          <Typography variant="h6" sx={{ mt: 2, mb: 0 }}>
            Feaures
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText>Works. Well.</ListItemText>
            </ListItem>
            <ListItem>
              <ListItemText>Completely open source.</ListItemText>
            </ListItem>
            <ListItem>
              <ListItemText>Your data isn't sent <em>anywhere</em>.</ListItemText>
            </ListItem>
          </List>
          <Button
            target="_blank"
            href="https://github.com/berellevy/job_app_filler"
            startIcon={<GitHubIcon />}
            variant="outlined"
          >
            Contribute
          </Button>
        </Container>
      </Box>
    </ThemeProvider>
  )
}


const rootel = document.createElement('div')
document.body.appendChild(rootel)

const root = createRoot(rootel)
root.render(<App />)