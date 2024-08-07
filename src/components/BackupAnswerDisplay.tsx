import {
  Breadcrumbs,
  Chip,
  Grid,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { FC } from 'react'
import { ConfirmButton } from './ConfirmButton'
import DeleteIcon from '@mui/icons-material/Delete'
import InfoIcon from '@mui/icons-material/Info'
import { Answer } from '../utils/types'

export const BackupAnswerDisplay: FC<{answer: Answer, handleDeleteAnswer: any}> = ({
  answer,
  handleDeleteAnswer,
}) => {

  return (
    <Paper elevation={4} sx={{ p: 1 }}>
      <Grid container direction="column">
        {answer.answer.map((a, index) => {
          return (
            <Grid item key={index}>
              <Typography
                component="div"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                {index + 1}) {String(a)}
                <ConfirmButton
                  component="IconButton"
                  action={handleDeleteAnswer}
                  dialogTitle="Are You Sure?"
                  buttonContent={<DeleteIcon />}
                >
                  Are you Sure you want to delete this answer? This action is
                  not reversible.
                </ConfirmButton>
              </Typography>
            </Grid>
          )
        })}
        {answer.path && (
          <Grid item>
            <Typography variant="h6">
              Path:{' '}
              <Tooltip title="The matching path that the answer was found with. Not always an exact match to the question path.">
                <InfoIcon  fontSize="inherit" />
              </Tooltip>
            </Typography>
            <Breadcrumbs separator=">">
              <Tooltip title="Page">
                <Chip variant="outlined" label={answer.path.page} />
              </Tooltip>
              <Tooltip title="Section">
                <Chip variant="outlined" label={answer.path.section} />
              </Tooltip>
              <Tooltip title="Question Type">
                <Chip variant="outlined" label={answer.path.fieldType} />
              </Tooltip>
              <Tooltip title="Question">
                <Chip variant="outlined" label={answer.path.fieldName} />
              </Tooltip>
            </Breadcrumbs>
          </Grid>
        )}
      </Grid>
    </Paper>
  )
}
