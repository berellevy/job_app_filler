import {
  Box,
  Button,
  Collapse,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { FC, useEffect } from 'react'

import { useAppContext } from '../../AppContext'
import {
  EditIcon,
  CloseIcon,
  AddIcon,
  InfoIcon,
  InputIcon,
  DeleteIcon,
  CloudUploadIcon,
  UploadFileIcon,
} from '../../utils/icons'
import { VisuallyHiddenInput } from '../VisuallyHiddenInput'
import {
  downloadFile,
  fileToLocalStorage,
  LocalStorageFile,
  localStorageToFile,
} from '../../utils/file'
import InsertDriveFile from '@mui/icons-material/InsertDriveFile'

export const AnswerValueSingleFileUpload: FC<{ id: number }> = ({ id }) => {
  const { editableAnswerState, backend } = useAppContext()
  const { setEditable, setEditedValue, cancelEdit } = editableAnswerState
  const { editedAnswer } = editableAnswerState.answers.find((a) => a.id === id)
  
  const deleteAnswerValue = () => {
    setEditedValue(id, "")
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
        {editedAnswer.value ? ( <>
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
        </IconButton></>
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

      {/* <Grid container direction={'column'} spacing={1}>
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
            />
          </Button>
        </Grid>
      </Grid> */}
    </>
  )
}
