import { Avatar, Box, Paper, Typography } from '@mui/material'
import { lime, blueGrey } from '@mui/material/colors'
import React from 'react'
const variant = "body2"
const Logo: React.FC = () => {
  return (
    <Box>
      <Paper elevation={6} sx={{ borderRadius: '50%' }}>
        <Avatar
          sx={{ bgcolor: blueGrey['300'], width: '1.5rem', height: '1.5rem' }}
        >
          <Typography
            sx={{ fontWeight: '100' }}
            color={'black'}
            variant={variant}
          >
            j
          </Typography>
          <Typography
            color={'black'}
            variant={variant}
            sx={{ fontWeight: '500' }}
          >
            a
          </Typography>
          <Typography
            color={'black'}
            variant={variant}
            sx={{ fontWeight: '900' }}
          >
            f
          </Typography>
        </Avatar>
      </Paper>
    </Box>
  )
}

export default Logo
