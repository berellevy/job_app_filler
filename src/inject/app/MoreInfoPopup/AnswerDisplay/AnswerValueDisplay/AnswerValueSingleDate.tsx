import {
  Collapse,
  Divider,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { FC } from 'react'

import { useAppContext } from '../../../AppContext'
import { joinComponents } from '@src/shared/utils/react'
import { CloseIcon, EditIcon, InputIcon } from '@src/shared/utils/icons'

/**
 * The Value is stored as an array of strings.
 */
export const AnswerValueSingleDate: FC<{ id: number }> = ({ id }) => {
  const {
    editableAnswerState: { setEditable, setEditedValue, cancelEdit, answers },
    backend,
  } = useAppContext()
  const {
    editedAnswer: { value },
    editable,
  } = answers.find((a) => a.id === id)

  const editFields =
    editable &&
    value.map((part: string, index: number) => {
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
          <Typography component="span">{value.join('/')}</Typography>
          <IconButton onClick={() => setEditable(id, true)}>
            <EditIcon />
          </IconButton>
        </>
      )}
    </>
  )
}
