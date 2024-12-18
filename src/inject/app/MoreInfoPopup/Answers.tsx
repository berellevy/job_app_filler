import {
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material'
import React, { FC } from 'react'

import { useAppContext } from '../context/AppContext'
import { CheckCircleIcon, DeleteIcon } from '@src/shared/utils/icons'
import AnswerDTO from '../services/DTOs/AnswerDTO'
import { ConfirmButton } from '../components/ConfirmButton'

const TableH = styled(TableCell)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 600,
}));

const AnswerRow: FC<{ answerDTO: AnswerDTO }> = ({ answerDTO }) => {
  const { id, fieldName, match, section, answer } = answerDTO
  const { answers } = useAppContext()


  const MatchValue = (
    match.type === 'exact'
      ? <Tooltip title="Exact Match">
        <CheckCircleIcon color='success' />
      </Tooltip>
      : <Tooltip title="Similarity Score">
        <span>{match.score.toFixed(2)}</span>
      </Tooltip>
  )

  const DeleteCell = (
    <TableCell>
      <ConfirmButton
        component="IconButton"
        action={() => answers.deleteAnswer(id)}
        dialogTitle="Are You Sure?"
        buttonContent={<DeleteIcon />}
      >
        Are you Sure you want to delete this answer? This action is
        not reversible.
      </ConfirmButton>
    </TableCell>
  )
  return (
    <TableRow>
      <TableCell>{MatchValue}</TableCell>
      <TableCell >{fieldName}</TableCell>
      {section && <TableCell>{section}</TableCell>}
      <TableCell>{answer.toString()}</TableCell>
      {DeleteCell}
    </TableRow>
  )
}

export const Answers: FC = () => {
  const { backend, answers: { data } } = useAppContext()
  return (
    <TableContainer sx={{ width: "100%" }} component={Paper}>
      <Table sx={{ width: "100%" }} size='small' stickyHeader>
        <TableHead>
          <TableRow >
            <TableH></TableH>
            <TableH >Question</TableH>
            {backend.section && <TableH>Section</TableH>}
            <TableH>Answer</TableH>
            <TableH></TableH>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((answerDTO) => <AnswerRow key={answerDTO.id} answerDTO={answerDTO} />)}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
