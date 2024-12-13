import { Answer106 } from '@src/shared/utils/types'
import  contentScriptAPI  from '../services/contentScriptApi'
import AnswerDTO from '../services/DTOs/AnswerDTO'
import { AppContextType } from '../context/types'

export interface SaveButtonClickHndler {
  (
    newAnswer: Answer106,
    context: Pick<
      AppContextType,
      'moreInfoPopper' | 'init' | 'editableAnswerState' | 'backend'
    >
  ): void | Promise<void>
}

const basic: SaveButtonClickHndler = async (newAnswer, { init, backend: {answerDTOClass} }) => {
  const resp = await contentScriptAPI.addAnswer(newAnswer, answerDTOClass)
  if (resp.ok) {
    await init()
  }
}

const withNotice: SaveButtonClickHndler = async (
  newAnswer,
  { moreInfoPopper }
) => {
  moreInfoPopper.open()
}

const backupAnswerList: SaveButtonClickHndler = async (
  newAnswer,
  { editableAnswerState, backend }
) => {
  const { answers, init } = editableAnswerState
  if (answers.length === 0) {
    await backend.save(newAnswer)
    await init()
  } else if (answers[0].originalAnswer.matchType === 'exact') {
    // make a popup that says to add a new answer
  }
}

export const saveButtonClickHandlers = {
  backupAnswerList,
  basic,
  withNotice,
}
