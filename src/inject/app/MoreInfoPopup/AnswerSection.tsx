import {
  Box,
  Fade,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { FC } from 'react'

import { useAppContext } from '../AppContext'
import { AddIcon, InfoIcon } from '@src/shared/utils/icons'
import { AnswerDisplayComponent } from './AnswerDisplay/AnswerDisplayComponent'
import { Item } from './components'
import { EditableAnswer } from '../hooks/useEditableAnswerState'

export const NoAnswerNotice: FC = () => {
  return (
    <Fade in timeout={{ enter: 350 }} unmountOnExit>
      <Item>
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
      </Item>
    </Fade>
  )
}

type ListContainerProps<T> = {
  items: T[]
  renderItem: (item: T) => React.ReactNode
}

export function ListFadeContainer<T>({
  items,
  renderItem,
}: ListContainerProps<T>) {
  return <>{items.map((item) => renderItem(item))}</>
}

export const AnswersContainer: FC<{ answers: EditableAnswer[] }> = ({
  answers,
}) => {
  return (
    <ListFadeContainer
      items={answers}
      renderItem={(answer) => (
        <Fade key={answer.id} in timeout={{ exit: 450 }} unmountOnExit>
          <div>
            <AnswerDisplayComponent id={answer.id} />
          </div>
        </Fade>
      )}
    />
  )
}

export const AnswersSection: FC = () => {
  const {
    backend,
    editableAnswerState: { answers, addNewAnswer },
  } = useAppContext()
  const hasAnswers = answers.length > 0

  const addNewAnswerButton = (
    <IconButton
      onClick={() => {
        const { path, answer } = backend.fieldSnapshot
        addNewAnswer(path, answer)
      }}
    >
      <AddIcon />
    </IconButton>
  )
  return (
    <>
      <Typography variant="h6" mb={2}>
        Answers
      </Typography>
      <Stack spacing={1}>
        {hasAnswers ? (
          <AnswersContainer answers={answers} />
        ) : (
          <NoAnswerNotice />
        )}
        <Box>{addNewAnswerButton}</Box>
      </Stack>
    </>
  )
}
