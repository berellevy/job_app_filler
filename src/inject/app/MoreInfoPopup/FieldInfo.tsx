import {
  Avatar,
  Breadcrumbs,
  Chip,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { FC } from 'react'

import { useAppContext } from '../AppContext'

export const FieldInfo: FC = () => {
  const { backend } = useAppContext()
  return (
    <>
      {' '}
      <Typography variant="h6">Question Path:</Typography>
      <Breadcrumbs separator=">">
        <Chip
          variant="outlined"
          avatar={
            <Tooltip title="Page">
              <Avatar>P</Avatar>
            </Tooltip>
          }
          label={backend.path.page}
        />
        <Chip
          variant="outlined"
          avatar={
            <Tooltip title="Section">
              <Avatar>S</Avatar>
            </Tooltip>
          }
          label={backend.path.section}
        />
        <Chip
          variant="outlined"
          avatar={
            <Tooltip title="Field Type">
              <Avatar>T</Avatar>
            </Tooltip>
          }
          label={backend.path.fieldType}
        />
        <Chip
          sx={{
            height: 'auto',
            minHeight: '32px',
            textWrap: 'inherit',
            '& .MuiChip-label': {
              display: 'block',
              whiteSpace: 'normal',
            },
          }}
          variant="outlined"
          avatar={
            <Tooltip title="Question">
              <Avatar>Q</Avatar>
            </Tooltip>
          }
          label={backend.path.fieldName}
        />
      </Breadcrumbs>
    </>
  )
}