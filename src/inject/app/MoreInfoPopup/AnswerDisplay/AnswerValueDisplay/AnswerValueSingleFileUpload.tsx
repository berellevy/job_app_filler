import {
  Box,
  Button,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { FC } from 'react'

import { useAppContext } from '../../../AppContext'
import { DeleteIcon, UploadFileIcon } from '@src/shared/utils/icons'
import { VisuallyHiddenInput } from '../../../components/VisuallyHiddenInput'
import {
  downloadFile,
  fileToLocalStorage,
  LocalStorageFile,
  localStorageToFile,
} from '@src/shared/utils/file'
import InsertDriveFile from '@mui/icons-material/InsertDriveFile'

export const AnswerValueSingleFileUpload: FC<{ id: number }> = ({ id }) => {
  const {
    editableAnswerState: { setEditable, setEditedValue, answers },
  } = useAppContext()

  const { editedAnswer } = answers.find((a) => a.id === id)

  const deleteAnswerValue = () => {
    setEditedValue(id, '')
    setEditable(id, true)
  }

  const handleUpload = async (fileList: FileList) => {
    const localStorageFile = await fileToLocalStorage(fileList[0])
    setEditable(id, true)
    setEditedValue(id, localStorageFile)
  }

  const handleDownload = (file: LocalStorageFile) => {
    downloadFile(localStorageToFile(file))
  }

  return (
    <>
      <Divider sx={{ mb: 1 }} />
      <Typography>Files:</Typography>
      <Box>
        {editedAnswer.value ? (
          <>
            <Tooltip title="download">
              <Button
                sx={{ textTransform: 'none' }}
                startIcon={<InsertDriveFile />}
                onClick={() => handleDownload(editedAnswer.value)}
              >
                {editedAnswer.value.name}
              </Button>
            </Tooltip>
            <IconButton onClick={() => deleteAnswerValue()}>
              <DeleteIcon />
            </IconButton>
          </>
        ) : (
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
            />
          </Button>
        )}
      </Box>
    </>
  )
}
