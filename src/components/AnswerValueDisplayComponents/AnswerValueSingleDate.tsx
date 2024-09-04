import {
  Collapse,
  Divider,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { FC, ReactElement, ReactNode, cloneElement } from 'react'

import { useAppContext } from '../../AppContext'
import { joinComponents } from '../../utils/react'
import { CloseIcon, EditIcon, InputIcon } from '../../utils/icons'

/**
 * The Value is stored as an array of strings.
 */
export const AnswerValueSingleDate: FC<{ id: number }> = ({ id }) => {
  const { editableAnswerState, backend } = useAppContext()
  const { setEditable, setEditedValue, cancelEdit } = editableAnswerState
  const { editedAnswer, editable } = editableAnswerState.answers[id]
  const { value } = editedAnswer

  const editFields =
    editable &&
    editedAnswer.value.map((part: string, index: number) => {
      return (
        <TextField
          key={index}
          variant="standard"
          inputProps={{ size: part.length }}
          value={part}
          onChange={(e) => {
            value[index] = e.target.value
            setEditedValue(id, structuredClone(value))
          }}
        />
      )
    })

  return (
    <>
      <Divider sx={{ mb: 1 }} />
      <Typography>Value:</Typography>
      {editable ? (
        <Collapse in={editable}>
          {joinComponents(
            editFields,
            <Typography mx={1} variant="h6" display={'inline-flex'}>
              /
            </Typography>
          )}
          <IconButton
            onClick={() => {
              setEditedValue(id, backend.currentValue())
            }}
          >
            <Tooltip title={`Fill with the current value.`}>
              <InputIcon />
            </Tooltip>
          </IconButton>
          <IconButton onClick={() => cancelEdit(id)}>
            <CloseIcon />
          </IconButton>
        </Collapse>
      ) : (
        <>
          <Typography component="span">
            {editedAnswer.value.join('/')}
          </Typography>
          <IconButton onClick={() => setEditable(id, true)}>
            <EditIcon />
          </IconButton>
        </>
      )}
    </>
  )
}
