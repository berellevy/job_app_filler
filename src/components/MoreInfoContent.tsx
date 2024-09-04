import {
  Avatar,
  Box,
  Breadcrumbs,
  Chip,
  Fade,
  IconButton,
  Paper,
  Stack,
  styled,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { FC } from 'react'

import { useAppContext } from '../AppContext'
import { AddIcon, InfoIcon } from '../utils/icons'
import { AnswerDisplayComponent } from './AnswerDisplayComponent'

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  color: theme.palette.text.secondary,
  elevation: 6,
}))

export const MoreInfoContent: FC = () => {
  const { currentValue, backend, editableAnswerState } = useAppContext()
  const { answers, addNewAnswer } = editableAnswerState
  const { path } = backend

  return (
    <Box padding={1}>
      <Stack spacing={2}>
        <Item>
          <Typography variant="h6">Question Path:</Typography>
          <Breadcrumbs separator=">">
            <Chip
              variant="outlined"
              avatar={
                <Tooltip title="Page">
                  <Avatar>P</Avatar>
                </Tooltip>
              }
              label={path.page}
            />
            <Chip
              variant="outlined"
              avatar={
                <Tooltip title="Section">
                  <Avatar>S</Avatar>
                </Tooltip>
              }
              label={path.section}
            />
            <Chip
              variant="outlined"
              avatar={
                <Tooltip title="Field Type">
                  <Avatar>T</Avatar>
                </Tooltip>
              }
              label={path.fieldType}
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
              label={path.fieldName}
            />
          </Breadcrumbs>
        </Item>
        <Item>
          <Typography variant="h6">Current Value</Typography>
          <Typography>{String(currentValue)}</Typography>
        </Item>
        <Item>
          <Typography variant="h6" mb={2}>
            Answers
          </Typography>
          <Stack spacing={1}>
            {answers.length > 0 ? (
              answers.map((a, index) => (
                <Fade key={index} in timeout={{ exit: 450 }} unmountOnExit>
                  <div>
                    <AnswerDisplayComponent id={index} />
                  </div>
                </Fade>
              ))
            ) : (
              <Fade in timeout={{ enter: 350 }} unmountOnExit>
                <Item>
                  <Typography
                    component={'div'}
                    sx={{
                      fontStyle: 'italic',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    No answer
                    <Tooltip title="Fill in the field and click save to save an answer">
                      <InfoIcon sx={{ marginLeft: '4px' }} fontSize="inherit" />
                    </Tooltip>
                  </Typography>
                </Item>
              </Fade>
            )}
            <Box>
              <IconButton
                onClick={() => {
                  const { path, answer } = backend.fieldSnapshot
                  addNewAnswer(path, answer)
                }}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Stack>
        </Item>
      </Stack>
    </Box>
  )
}
