import {
  Breadcrumbs,
  Button,
  Chip,
  Collapse,
  Fade,
  Grid,
  Grow,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { FC, useEffect, useRef, useState } from 'react'
import { ConfirmButton } from './ConfirmButton'
import DeleteIcon from '@mui/icons-material/Delete'
import InfoIcon from '@mui/icons-material/Info'
import { Answer } from '../utils/types'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import { LocalAnswer, LocalAnswerState } from '../App'

const EditableField: FC<any> = ({
  id,
  value,
  isEditable,
  setLocalAnswers,
  localAnswers,
  handleSaveAnswer,
  answer,
}) => {
  const handleChange = (e) => {
    setLocalAnswers((previousAnswers: LocalAnswer[]) =>
      previousAnswers.map(([str, editable], i) =>
        i === id ? [e.target.value, editable] : [str, editable]
      )
    )
  }

  const setIsEditable = () => {
    setLocalAnswers((previousAnswers: LocalAnswer[]) =>
      previousAnswers.map(([str, editable], i) =>
        i === id ? [str, true] : [str, editable]
      )
    )
  }
  return (
    <>
      <Collapse in={isEditable} unmountOnExit>
        <TextField
          value={value}
          label="edit/add"
          onChange={handleChange}
          autoFocus
        />
      </Collapse>
      <Collapse in={!isEditable} unmountOnExit>
        <Typography
          component="div"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          {value}{' '}
          <IconButton
            onClick={() => {
              setIsEditable()
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => {
              const newAanswer = {
                ...answer,
                answer: localAnswers
                  .map((answer, index) => {
                    if (id != index) {
                      return answer[0]
                    }
                  })
                  .filter(Boolean),
              }
              handleSaveAnswer(newAanswer)
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Typography>
      </Collapse>
    </>
  )
}

export const BackupAnswerDisplay: FC<{
  answer: Answer
  handleDeleteAnswer: any
  handleSaveAnswer: any
  localAnswerState: LocalAnswerState
}> = ({ answer, handleDeleteAnswer, handleSaveAnswer, localAnswerState }) => {
  const [localAnswers, setLocalAnswers] = localAnswerState
  const hasMounted = useRef(false)
  useEffect(() => {
    if (hasMounted.current) {
      setLocalAnswers(answer.answer.map((answer: string) => [answer, false]))
    } else {
      hasMounted.current = true
      if (localAnswers.length === 0) {
        setLocalAnswers(answer.answer.map((answer: string) => [answer, false]))
      }
    }
  }, [answer.answer])

  const editMode = localAnswers.some(([val, editable]) => editable)

  return (
    <Paper elevation={4} sx={{ p: 1 }}>
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Typography variant="h6">
            Path:{' '}
            <Tooltip title="The matching path that the answer was found with. Not always an exact match to the question path.">
              <InfoIcon fontSize="inherit" />
            </Tooltip>
            <ConfirmButton
              component="IconButton"
              dialogTitle="Delete all answers?"
              action={handleDeleteAnswer}
              buttonContent={<DeleteIcon />}
            >
              This will delete this path and all the answers saved with it.
            </ConfirmButton>
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
        <Grid item>
          <Collapse in={editMode}>
            <Button
              onClick={() => {
                const newAnswer = {
                  ...answer,
                  answer: localAnswers.map((i) => i[0]),
                }
                handleSaveAnswer(newAnswer)
              }}
            >
              Save
            </Button>
            <Button
              onClick={() => {
                setLocalAnswers(
                  answer.answer.map((answer: string) => [answer, false])
                )
              }}
            >
              Cancel
            </Button>
          </Collapse>
        </Grid>
        {localAnswers.map(([value, editable], index) => {
          return (
            <Grid item key={index}>
              <Collapse in>
                <EditableField
                  value={value}
                  id={index}
                  setLocalAnswers={setLocalAnswers}
                  isEditable={editable}
                  localAnswers={localAnswers}
                  handleSaveAnswer={handleSaveAnswer}
                  answer={answer}
                />
              </Collapse>
            </Grid>
          )
        })}
        <Grid item>
          <IconButton
            onClick={() => {
              setLocalAnswers([...localAnswers, ['', true]])
            }}
          >
            <AddIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Paper>
  )
}
