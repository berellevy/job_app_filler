import { AppContextType } from "../AppContext";
import { Answer } from "../utils/types";

export interface SaveButtonClickHndler {
  (newAnswer: Answer, context: AppContextType): void | Promise<void>
}

const simpleText: SaveButtonClickHndler = async (newAnswer, context) => {
  const {editableAnswerState, backend, moreInfoPopper} = context
  
  if (editableAnswerState.answers.length === 0) {
    await backend.save(newAnswer)
    await editableAnswerState.init()
  } else {
    editableAnswerState.addNewAnswer(newAnswer.path, newAnswer.answer)
    moreInfoPopper.open()
  }
}


const backupAnswerList: SaveButtonClickHndler = async (newAnswer, context) => {
  const {editableAnswerState, backend, moreInfoPopper} = context
  const {answers, init} = editableAnswerState
  if (answers.length === 0) {
    await backend.save(newAnswer)
    await init()
  } else if (answers[0].originalAnswer.matchType === "exact") {
    // make a popup that says to add a new answer
  }
}

export const saveButtonClickHandlers = {
  simpleText,
  backupAnswerList,
}