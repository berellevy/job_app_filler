import {
  Collapse,
  Divider,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { FC, MouseEvent, useState } from 'react'

import { useAppContext } from '../../AppContext'
import { joinComponents } from '../../utils/react'
import { CloseIcon, EditIcon, InputIcon } from '../../utils/icons'
import { AbsoluteRelativeSwitch } from '../AbsoluteRelativeSwitch'

/**
 * The Value is stored as an array of strings.
 */
export const AnswerValueSingleRelativeDate: FC<{ id: number }> = ({ id }) => {
  const { editableAnswerState, backend } = useAppContext()
  const { setEditable, setEditedValue, cancelEdit } = editableAnswerState
  const { editedAnswer, editable } = editableAnswerState.answers.find((a) => a.id === id)
  const { value } = editedAnswer

  const toggleRelative = ({ target }) => {
    value.relative = target.checked
    if (value.relative) {
      value.relativeValue = 'today'
    }
    setEditedValue(id, structuredClone(value))
  }
  const fieldLengths = [2, 2, 4]
  const AbsoluteDateEditFields =
    editable &&
    !value.relative &&
    value.absoluteValue &&
    value.absoluteValue.map((part: string, index: number) => {
      return (
        <TextField
          key={index}
          variant="standard"
          inputProps={{ size: fieldLengths[index] }}
          value={part}
          onChange={(e) => {
            value.absoluteValue[index] = e.target.value
            setEditedValue(id, structuredClone(value))
          }}
        />
      )
    })
  const AbsoluteDateEditComponent =
    AbsoluteDateEditFields &&
    joinComponents(
      AbsoluteDateEditFields,
      <Typography mx={1} variant="h6" display={'inline-flex'}>
        /
      </Typography>
    )

  return (
    <>
      <Divider sx={{ mb: 1 }} />
      <Typography>Value:</Typography>
      {editable ? (
        <Collapse in={editable}>
          {!value.relative ? (
            <>
              {AbsoluteDateEditComponent}
              <IconButton
                onClick={() => {
                  value.absoluteValue = backend.currentValue()
                  setEditedValue(id, structuredClone(value))
                }}
              >
                <Tooltip title={`Fill with the current value.`}>
                  <InputIcon />
                </Tooltip>
              </IconButton>
            </>
          ) : (
            <Typography display={'inline'}>Current Date</Typography>
          )}

          <AbsoluteRelativeSwitch checked={value.relative} onChange={toggleRelative} />

          <IconButton onClick={() => cancelEdit(id)}>
            <CloseIcon />
          </IconButton>
        </Collapse>
      ) : (
        <>
          <Typography component="span">
            {value.relative
              ? value.relativeValue
              : editedAnswer.value.absoluteValue.join('/')}
          </Typography>
          <IconButton onClick={() => setEditable(id, true)}>
            <EditIcon />
          </IconButton>
        </>
      )}
    </>
  )
}
