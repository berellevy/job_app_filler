import {
  Checkbox,
  Collapse,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { FC } from 'react'

import { useAppContext } from '../../../AppContext'
import { CloseIcon, EditIcon, InputIcon } from '@src/shared/utils/icons'

export const AnswerValueSingleBool: FC<{ id: number }> = ({ id }) => {
  const { editableAnswerState, backend } = useAppContext()
  const { setEditable, setEditedValue, cancelEdit } = editableAnswerState
  const { editedAnswer, editable } = editableAnswerState.answers.find((a) => a.id === id)

  return (
    <>
      <Divider sx={{ mb: 1 }} />
      <Typography>Value:</Typography>
      {editable ? (
        <Collapse in={editable}>
          <Checkbox
            checked={editedAnswer.value}
            onChange={(e) => setEditedValue(id, e.target.checked)}
          />
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
          <Typography component="span">{String(editedAnswer.value)}</Typography>
          <IconButton onClick={() => setEditable(id, true)}>
            <EditIcon />
          </IconButton>
        </>
      )}
    </>
  )
}
