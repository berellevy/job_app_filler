import {
    Box,
    Fade,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from '@mui/material'
import React, { FC } from 'react'

import { useAppContext } from '../context/AppContext'
import { AddIcon, InfoIcon } from '@src/shared/utils/icons'
import { AnswerDisplayComponent } from './AnswerDisplay/AnswerDisplayComponent'
import { Item } from './components'



export const Answers: FC = () => {
    const {backend, answers: {data}} = useAppContext()
    return (
        <TableContainer>
            <Table size='small' stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell>Question</TableCell>
                        <TableCell>Match</TableCell>
                        {backend.section && <TableCell>Section</TableCell> }
                        <TableCell>Answer</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((answer) => (
                        <TableRow key={answer.id}>
                            <TableCell>{answer.fieldName}</TableCell>
                            <TableCell>{answer.matchType}</TableCell>
                            {answer.section && <TableCell>{answer.section}</TableCell> }
                            <TableCell>{answer.answer.toString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}
