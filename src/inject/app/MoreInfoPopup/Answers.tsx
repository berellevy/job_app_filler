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

const TH = styled(TableCell)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 600,
}));

const TD = styled(TableCell)(({ theme }) => ({
  verticalAlign: "top"
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

  const DeleteButton = (

      <ConfirmButton
        component="IconButton"
        action={() => answers.deleteAnswer(id)}
        dialogTitle="Are You Sure?"
        buttonContent={<DeleteIcon />}
      >
        Are you Sure you want to delete this answer? This action is
        not reversible.
      </ConfirmButton>
  )
  return (
    <TableRow>
      <TD>{MatchValue}</TD>
      <TD >{fieldName}</TD>
      {section && <TD>{section}</TD>}
      <TD>{answer.toString()}</TD>
      <TD>{DeleteButton}</TD>
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
            <TH></TH>
            <TH >Question</TH>
            {backend.section && <TH>Section</TH>}
            <TH>Answer</TH>
            <TH></TH>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((answerDTO) => <AnswerRow key={answerDTO.id} answerDTO={answerDTO} />)}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
