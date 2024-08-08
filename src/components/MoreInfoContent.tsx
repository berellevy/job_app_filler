import {
  Breadcrumbs,
  Chip,
  Fade,
  Paper,
  Stack,
  styled,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { FC } from 'react'
import InfoIcon from '@mui/icons-material/Info'

import { SingleAnswerDisplay } from './SingleAnswerDisplay'
import { BaseFormInput } from '../formFields/baseFormInput'
import { BackupAnswerDisplay } from './BackupAnswerDisplay'
import { Answer, AnswerDisplayType, FieldPath } from '../utils/types'
import { LocalAnswerState } from '../App'

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  color: theme.palette.text.secondary,
  elevation: 4,
}))

const answerDisplays = {
  SingleAnswerDisplay,
  BackupAnswerDisplay,
}
const getAnswerDisplay = (type?: AnswerDisplayType | null): FC<any> => {
  return answerDisplays[type] || SingleAnswerDisplay
}

export const MoreInfoContent: FC<{
  backend: BaseFormInput<any>
  answer: any
  answerDisplayType?: AnswerDisplayType
  handleDeleteAnswer: () => Promise<void>
  handleSaveAnswer: (answer?: Answer) => Promise<any>
  currentValue: any
  path: FieldPath
  localAnswerState: LocalAnswerState
}> = ({
  answer,
  handleDeleteAnswer,
  currentValue,
  path,
  answerDisplayType,
  handleSaveAnswer,
  localAnswerState,
}) => {
  const AnswerDisplay = getAnswerDisplay(answerDisplayType)
  return (
    <Stack>
      <Item>
        <Typography variant="h6">Question Path:</Typography>
        <Breadcrumbs separator=">">
          <Tooltip title="Page">
            <Chip variant="outlined" label={path.page} />
          </Tooltip>
          <Tooltip title="Section">
            <Chip variant="outlined" label={path.section} />
          </Tooltip>
          <Tooltip title="Question Type">
            <Chip variant="outlined" label={path.fieldType} />
          </Tooltip>
          <Tooltip title="Question">
            <Chip variant="outlined" label={path.fieldName} />
          </Tooltip>
        </Breadcrumbs>
      </Item>
      <Item>
        <Typography variant="h6">Current Value</Typography>
        <Typography>{String(currentValue)}</Typography>
      </Item>
      <Item>
        <Typography variant="h6">Answers</Typography>
        {answer.hasAnswer && (
          <Fade in={answer.hasAnswer} timeout={{exit: 450}} unmountOnExit>
            <div>
              <AnswerDisplay
                answer={answer}
                handleDeleteAnswer={handleDeleteAnswer}
                handleSaveAnswer={handleSaveAnswer}
                localAnswerState={localAnswerState}
              />
            </div>
          </Fade>
        )}
        <Fade in={!answer.hasAnswer} timeout={{enter: 350}} unmountOnExit>
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
        </Fade>
      </Item>
    </Stack>
  )
}
