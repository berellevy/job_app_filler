import { Avatar, Box, Paper, Typography } from '@mui/material'
import React, { FC } from 'react'
import { theme } from '../utils/react'

const variant = 'body2'

const sizes = {
  small: "1.25rem",
  medium: "1.5rem",
  large: "2.25rem"
} as const 
type Size = keyof typeof sizes

const Logo: FC<{size?: Size}> = ({size = "small"}) => {


  return (
    <Box>
      <Paper elevation={6} sx={{ borderRadius: '50%' }}>
        <Avatar
          sx={{
            fontSize: sizes[size],
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
