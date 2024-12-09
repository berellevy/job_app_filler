import {
  Button,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { FC } from 'react'

import { useAppContext } from '../../../AppContext'
import {
  DeleteIcon,
  UploadFileIcon,
} from '@src/shared/utils/icons'
import { VisuallyHiddenInput } from '../../../components/VisuallyHiddenInput'
import {
  downloadFile,
  fileToLocalStorage,
  LocalStorageFile,
  localStorageToFile,
} from '@src/shared/utils/file'
import InsertDriveFile from '@mui/icons-material/InsertDriveFile'

export const AnswerValueMultiFileUpload: FC<{ id: number }> = ({ id }) => {
  const { editableAnswerState, backend } = useAppContext()
  const { setEditable, setEditedValue, } = editableAnswerState
  const { editedAnswer } = editableAnswerState.answers.find((a) => a.id === id)
  
  const deleteAnswerValue = (answerValueId) => {
    const { value } = editedAnswer
    delete value[answerValueId]
    setEditedValue(id, structuredClone(value.filter(Boolean)))
    setEditable(id, true)
  }

  const handleUpload = async (fileList: FileList) => {
    setEditable(id, true)
    for (const file of fileList) {
      editedAnswer.value.push(await fileToLocalStorage(file))
    }
    setEditedValue(id, structuredClone(editedAnswer.value))
  }

  const handleDownload = (file: LocalStorageFile) => {
    downloadFile(localStorageToFile(file))
  }

  return (
    <>
      <Divider sx={{ mb: 1 }} />
      <Typography>Files:</Typography>
      <Grid container direction={'column'} spacing={1}>
        {editedAnswer.value.map(
          (file: LocalStorageFile, answerValueId: number) => {
            return (
              <Grid item key={`${id}-${answerValueId}`}>
                <Tooltip title="download">
                  <Button
                    sx={{ textTransform: 'none' }}
                    startIcon={<InsertDriveFile />}
                    onClick={() => handleDownload(file)}
                  >
                    {file.name}
                  </Button>
                </Tooltip>
                <IconButton onClick={() => deleteAnswerValue(answerValueId)}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            )
          }
        )}
        <Grid item>
          <Button
            component="label"
            role={undefined}
            // variant="contained"
            tabIndex={-1}
            startIcon={<UploadFileIcon />}
          >
            Upload files
            <VisuallyHiddenInput
              type="file"
              onChange={(event) => handleUpload(event.target.files)}
              multiple
            />
          </Button>
        </Grid>
      </Grid>
    </>
  )
}
