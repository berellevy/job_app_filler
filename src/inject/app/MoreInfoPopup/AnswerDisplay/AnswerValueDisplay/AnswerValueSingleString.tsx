import {
  Collapse,
  Divider,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { FC } from 'react'

import { CloseIcon, EditIcon, InputIcon } from '@src/shared/utils/icons'
import { useAppContext } from '../../../AppContext'

export const AnswerValueSingleString: FC<{ id: number }> = ({ id }) => {
  const {
    editableAnswerState: { setEditable, setEditedValue, cancelEdit, answers },
    backend,
  } = useAppContext()
  const { editedAnswer, editable } = answers.find((a) => a.id === id)
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
