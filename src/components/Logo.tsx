import { Avatar, Box, Paper, Typography } from '@mui/material'
import React from 'react'
import { theme } from '../utils/react'
const variant = 'body2'
const Logo: React.FC = () => {
  return (
    <Box>
      <Paper elevation={6} sx={{ borderRadius: '50%' }}>
        <Avatar
          sx={{
            bgcolor: theme.palette.primary.main,
            width: '1.7em',
            height: '1.7em',
          }}
        >
          <Typography
            color={'white'}
            variant={variant}
            sx={{ fontWeight: '100', fontSize: '.65em' }}
          >
            j
          </Typography>
          <Typography
            color={'white'}
            variant={variant}
            sx={{ fontWeight: '500', fontSize: '.75em' }}
          >
            a
          </Typography>
          <Typography
            color={'white'}
            variant={variant}
            sx={{ fontWeight: '900', fontSize: '.8em' }}
          >
            f
          </Typography>
        </Avatar>
      </Paper>
    </Box>
  )
}

export default Logo
