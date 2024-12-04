import { Alert, AlertTitle, Paper, styled } from '@mui/material'
import React, { FC } from 'react'

import { Markdown } from '../components/Markdown'

export const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  margin: theme.spacing(1),
  padding: theme.spacing(1),
  color: theme.palette.text.secondary,
  elevation: 6,
}))

export const FieldNotice: FC<{ children: string }> = ({ children }) => {
  return (
    <Alert variant="filled" severity="info">
      <AlertTitle>NOTE</AlertTitle>
      <Markdown>{children}</Markdown>
    </Alert>
  )
}
