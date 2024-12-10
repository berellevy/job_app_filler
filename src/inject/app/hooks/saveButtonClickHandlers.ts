import { Answer } from '@src/shared/utils/types'
import { AppContextType } from '../AppContext'
import { contentScriptAPI } from '../services/contentScriptApi'

export interface SaveButtonClickHndler {
  (
    newAnswer: Answer,
    context: Pick<
      AppContextType,
      'moreInfoPopper' | 'init' | 'editableAnswerState' | 'backend'
    >
  ): void | Promise<void>
}

const basic: SaveButtonClickHndler = async (newAnswer, { init }) => {
  const resp = await contentScriptAPI.send('addAnswer', newAnswer)
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
