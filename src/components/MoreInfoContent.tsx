import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { FieldPath } from '../formFields/types'

export const MoreInfoContent: FC<{
  hasAnswer: boolean
  answer: any
  handleDeleteAnswer: () => Promise<void>
  currentValue: any
  path: FieldPath
}> = ({ hasAnswer, answer, handleDeleteAnswer, currentValue, path }) => {
  const { page, section, fieldType, fieldName } = path
  return (
    <TableContainer>
      <Table size="small">
        <TableBody>
          <TableRow>
            <TableCell sx={{ p: 0 }} colSpan={2}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Path</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell variant="head" sx={{ verticalAlign: 'top' }}>
                          Page
                        </TableCell>
                        <TableCell>{page}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell variant="head" sx={{ verticalAlign: 'top' }}>
                          Section
                        </TableCell>
                        <TableCell>{section}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell variant="head" sx={{ verticalAlign: 'top' }}>
                          Question Type
                        </TableCell>
                        <TableCell>{fieldType}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell variant="head" sx={{ verticalAlign: 'top' }}>
                          Question
                        </TableCell>
                        <TableCell>{fieldName}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ verticalAlign: 'top' }} variant="head">
              Answer
            </TableCell>
            <TableCell sx={{ verticalAlign: 'top' }} align="left">
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
            <TableCell sx={{ verticalAlign: 'top' }} variant="head">
              Current
            </TableCell>
            <TableCell>
              <Typography>{String(currentValue)}</Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}
