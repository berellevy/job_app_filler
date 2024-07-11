import React from 'react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

export const FillButton: React.FC<{
  onClick?: () => void
}> = (onClick) => {
  return (
    <Button>
      <Typography>Fill</Typography>
    </Button>
  )
}
