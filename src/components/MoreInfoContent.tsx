import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { FC } from 'react'
import { ConfirmButton } from './ConfirmButton'
import DeleteIcon from '@mui/icons-material/Delete'
import InfoIcon from '@mui/icons-material/Info'

export const MoreInfoContent: FC<{
  hasAnswer: boolean
  answer: any
  handleDeleteAnswer: () => Promise<void>
  currentValue: any
}> = ({ hasAnswer, answer, handleDeleteAnswer, currentValue }) => {
  return (
    <TableContainer>
      <Table size="small">
        <TableBody>
          <TableRow>
            <TableCell align="right" variant="head">
              Answer
            </TableCell>
            <TableCell align="left">
              {hasAnswer ? (
                <Typography
                  component="div"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {String(answer)}
                  <ConfirmButton
                    component="IconButton"
                    action={handleDeleteAnswer}
                    dialogTitle="Are You Sure?"
                    buttonContent={<DeleteIcon />}
                  >
                    Are you Sure you want to delete this answer? This action is
                    not reversible.
                  </ConfirmButton>
                </Typography>
              ) : (
                <Typography
                  component={'div'}
                  sx={{
                    fontStyle: 'italic',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  No answer
                  <Tooltip title="Fill in the field and click save to save an answer">
                    <InfoIcon sx={{ marginLeft: '4px' }} fontSize="inherit" />
                  </Tooltip>
                </Typography>
              )}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell variant="head">Current</TableCell>
            <TableCell>{String(currentValue)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}
