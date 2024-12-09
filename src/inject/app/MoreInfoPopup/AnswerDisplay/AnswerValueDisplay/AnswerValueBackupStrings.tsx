import {
  Divider,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { FC, useEffect } from 'react'

import { useAppContext } from '../../../AppContext'
import {
  EditIcon,
  CloseIcon,
  AddIcon,
  InfoIcon,
  InputIcon,
  DeleteIcon,
} from '@src/shared/utils/icons'

export const AnswerValueBackupStrings: FC<{ id: number }> = ({ id }) => {
  const { editableAnswerState, backend } = useAppContext()
  const { setEditable, setEditedValue, cancelEdit } = editableAnswerState
  const { editedAnswer, isNew } = editableAnswerState.answers.find((a) => a.id === id)

  useEffect(() => {
    if (isNew) {
      setValueEditable(0, true)
    }
  }, [])

  const addNewAnswerValue = () => {
    const { value } = editedAnswer
    setEditedValue(id, [...value, ['', true]])
    setEditable(id, true)
  }

  const setValueEditable = (answerValueId, editable) => {
    const { value } = editedAnswer
    value[answerValueId][1] = editable
    setEditedValue(id, structuredClone(value))
    if (editable) {
      setEditable(id, true)
    } else if (!value.some(([_, editable]) => editable)) {
      cancelEdit(id)
    }
  }

  const setSingleEditedValue = (answerValueId: number, newValue: string) => {
    const { value } = editedAnswer
    value[answerValueId][0] = newValue
    setEditedValue(id, structuredClone(value))
  }

  const deleteAnswerValue = (answerValueId) => {
    const {value} = editedAnswer
    delete value[answerValueId]
    setEditedValue(id, structuredClone(value.filter(Boolean)))
    setEditable(id, true)
  }
  
  return (
    <>
      <Divider sx={{ mb: 1 }} />
      <Typography>Values:</Typography>
      <Grid container direction={'column'} spacing={1}>
        {editedAnswer.value.map(([answer, valueEditable], answerValueId) => {
          return (
            <Grid item key={`${id}-${answerValueId}`}>
              {!valueEditable ? (
                <>
                  <Typography display="inline-flex">{answer}</Typography>
                  <IconButton
                    onClick={() => setValueEditable(answerValueId, true)}
                  >
                    <EditIcon />
                  </IconButton>
                </>
              ) : (
                <>
                  <TextField
                    variant="standard"
                    inputProps={{
                      size: Math.max(answer?.length || 0 + 1, 15),
                    }}
                    InputProps={{
                      endAdornment: (
                        <>
                          <IconButton
                            onClick={() => {
                              setSingleEditedValue(
                                answerValueId,
                                backend.currentValue()
                              )
                            }}
                          >
                            <Tooltip title={`Fill with the current value.`}>
                              <InputIcon />
                            </Tooltip>
                          </IconButton>
                          <IconButton
                            onClick={() =>
                              setValueEditable(answerValueId, false)
                            }
                          >
                            <CloseIcon />
                          </IconButton>
                        </>
                      ),
                    }}
                    value={answer}
                    onChange={(e) =>
                      setSingleEditedValue(answerValueId, e.target.value)
                    }
                  />
                </>
              )}
              <IconButton onClick={() => deleteAnswerValue(answerValueId)}>
                <DeleteIcon />
              </IconButton>
            </Grid>
          )
        })}
        <Grid item>
          <IconButton onClick={addNewAnswerValue}>
            <AddIcon />
          </IconButton>
          <Tooltip title="Add a backup answer to this answer path.">
            <InfoIcon fontSize="inherit" />
          </Tooltip>
        </Grid>
      </Grid>
    </>
  )
}
