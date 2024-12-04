import { AppBar, Toolbar, Box, Typography } from '@mui/material'
import React, { FC, ReactNode } from 'react'
import Logo from './Logo'
import { teal } from '@mui/material/colors'

export const LogoTitleBar: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AppBar color="secondary" position="static">
      <Toolbar>
        <Box sx={{ mr: 2 }}>
          <Logo size="medium" />
        </Box>
        <Typography
          color={teal[900]}
          variant="h5"
          component="div"
          sx={{ flexGrow: 1 }}
        >
          {children}
        </Typography>
      </Toolbar>
    </AppBar>
  )
}
