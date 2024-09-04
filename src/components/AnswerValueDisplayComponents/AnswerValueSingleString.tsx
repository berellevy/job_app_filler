import {
  Collapse,
  Divider,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { FC } from 'react'
import { useAppContext } from '../../AppContext'
import { CloseIcon, EditIcon, InputIcon } from '../../utils/icons'

export const AnswerValueSingleString: FC<{ id: number }> = ({ id }) => {
  const { editableAnswerState, backend } = useAppContext()
  const { setEditable, setEditedValue, cancelEdit} = editableAnswerState
  const { editedAnswer, editable } = editableAnswerState.answers[id]
  return (
    <>
      <Divider sx={{ mb: 1 }} />
      <Typography>Value:</Typography>
      {editable ? (
        <Collapse in={editable}>
          <TextField
            variant="standard"
            fullWidth
            multiline
            value={editedAnswer.value}
            onChange={(e) => setEditedValue(id, e.target.value)}
            InputProps={{
              endAdornment: (
                <>
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
                </>
              ),
            }}
          />
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
