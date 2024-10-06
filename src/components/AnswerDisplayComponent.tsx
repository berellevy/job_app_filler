import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Grid,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { FC, useRef } from 'react'
import { ConfirmButton } from './ConfirmButton'
import { useAppContext } from '../AppContext'
import { SimplePopper } from './SimplePopper'
import { DeleteIcon, EditIcon, CloseIcon } from '../utils/icons'
import _ from 'lodash';
import { sentenceCase } from '../utils/storage/utils'



export const AnswerDisplayComponent: FC<{ id: number }> = ({ id }) => {
  const { editableAnswerState, backend} = useAppContext()
  const { setEditable, setEditedPath, cancelEdit, saveAnswer, deleteAnswer } =
    editableAnswerState
  const { editedAnswer, originalAnswer, editable, error, isNew } =
    editableAnswerState.answers.find((a) => a.id === id)
  const errorPopperRef = useRef(null)
  
  return (
    <Paper elevation={4} sx={{ p: 1, width: '100%' }}>
      <SimplePopper
        anchorRef={errorPopperRef}
        message={error}
        placement={'top'}
      />
      <Grid spacing={2} ref={errorPopperRef} container direction="column">
        <Grid item>
          <Grid container justifyContent="space-between" direction={'row'}>
            <Box>
              <Typography>Path:</Typography>
              {originalAnswer.matchType && (
                <Typography variant="caption">
                  Match: {sentenceCase(originalAnswer.matchType)}
                </Typography>
              )}
            </Box>
            <Box>
              {editable && (
                <>
                  {' '}
                  <Button onClick={() => saveAnswer(id)}>Save</Button>
                  <Button onClick={() => cancelEdit(id)}>Cancel</Button>
                </>
              )}
            </Box>
            <Box>
              {!isNew && (
                <ConfirmButton
                  component="IconButton"
                  action={() => deleteAnswer(id)}
                  dialogTitle="Are You Sure?"
                  buttonContent={<DeleteIcon />}
                >
                  Are you Sure you want to delete this answer? This action is
                  not reversible.
                </ConfirmButton>
              )}
            </Box>
          </Grid>
          <Breadcrumbs separator=">">
            <Chip
              variant="outlined"
              label={editedAnswer.path.page}
              avatar={
                <Tooltip title="Page">
                  <Avatar>P</Avatar>
                </Tooltip>
              }
            />
            <Chip
              variant="outlined"
              label={editedAnswer.path.section}
              avatar={
                <Tooltip title="Section">
                  <Avatar>S</Avatar>
                </Tooltip>
              }
            />

            <Chip
              variant="outlined"
              label={editedAnswer.path.fieldType}
              avatar={
                <Tooltip title="Field Type">
                  <Avatar>T</Avatar>
                </Tooltip>
              }
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
              label={
                editable ? (
                  <TextField
                    variant="standard"
                    fullWidth
                    multiline
                    value={editedAnswer.path.fieldName}
                    onChange={(e) =>
                      setEditedPath(id, 'fieldName', e.target.value)
                    }
                    InputProps={{
                      sx: { font: 'inherit', height: 'fit-content' },
                      endAdornment: (
                        <IconButton onClick={() => cancelEdit(id)}>
                          <CloseIcon />
                        </IconButton>
                      ),
                    }}
                  />
                ) : (
                  editedAnswer.path.fieldName
                )
              }
              avatar={
                <Tooltip title="Question">
                  <Avatar>Q</Avatar>
                </Tooltip>
              }
              {...(!editable && {
                deleteIcon: <EditIcon />,
                onDelete: () => setEditable(id, true),
              })}
            />
          </Breadcrumbs>
        </Grid>

        <Grid item>
          <backend.answerValue.displayComponent id={id} />
        </Grid>
      </Grid>
    </Paper>
  )
}
