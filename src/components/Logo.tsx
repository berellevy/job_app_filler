import { Avatar, Box, Paper, Typography } from '@mui/material'
import { lime, blueGrey, cyan, green, red, pink, teal } from '@mui/material/colors'
import React from 'react'
const variant = "body2"
const Logo: React.FC = () => {
  return (
    <Box >
      <Paper elevation={6} sx={{ borderRadius: '50%' }}>
        <Avatar
          sx={{ bgcolor: teal[500], width: '1.7em', height: '1.7em' }}
        >
          <Typography
            sx={{ fontWeight: '100', fontSize: ".65em"}}
            variant={variant}
          >
            j
          </Typography>
          <Typography
            variant={variant}
            sx={{ fontWeight: '500', fontSize: ".75em"}}
          >
            a
          </Typography>
          <Typography
            variant={variant}
            sx={{ fontWeight: '900', fontSize: '.8em'}}
          >
            f
          </Typography>
        </Avatar>
      </Paper>
    </Box>
  )
}

export default Logo
