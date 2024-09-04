import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react'
import { BaseFormInput } from '../formFields/baseFormInput'
import { Answer, FieldPath } from '../utils/types'
import * as comparePath from '../utils/storage/comparePath'
import { sleep } from '../utils/async'

export type EditableAnswerState = {
  answers: EditableAnswer[]
  initAnswer?: (
    originalAnswer: Answer,
    isNew?: boolean,
    editable?: boolean
  ) => EditableAnswer
  init: () => Promise<void>
  setEditable: (id: number, editable: boolean) => void
  cancelEdit: (id: number) => void
  setEditedPath: (id: number, key: keyof FieldPath, value: any) => void
  setEditedValue: (id: number, value: any) => void
  editedPathMatchesExistingPath: boolean
  saveAnswer: (id: number) => Promise<void>
  addNewAnswer: (path: FieldPath, value: any) => void
  deleteAnswer: (id: number) => Promise<void>
}

export type EditableAnswer = {
  originalAnswer: Answer
  editedAnswer: {
    value: any
    path: FieldPath
  }
  editable: boolean
  isNew: boolean
  error?: string
}



export const useEditableAnswerState = (
  backend: BaseFormInput<any>,
): EditableAnswerState => {
  const [answers, setAnswers] = useState<EditableAnswer[]>([])
  const [editedPathMatchesExistingPath, setEditedPathMatchesExistingPath] =
    useState<boolean>(false)

  const tempErrorMessage = (
    id: number,
    errorMessage: string | null,
    timeout: number = 1000
  ) => {
    setAnswers((answers) => {
      answers[id].error = errorMessage
      return structuredClone(answers)
    })
    if (Boolean(errorMessage)) {
      sleep(timeout).then(() => tempErrorMessage(id, null))
    }
  }



  const initAnswer: EditableAnswerState['initAnswer'] = (
    originalAnswer,
    isNew = false,
    editable = false
  ) => {
    return {
      originalAnswer,
      editedAnswer: {
        value: backend.answerValue.init(originalAnswer.answer),
        path: { ...originalAnswer.path },
      },
      editable,
      isNew,
    }
  }

  const init: EditableAnswerState['init'] = async () => {
    const originalAnswers = await backend.answer()
    const editableAnswers = originalAnswers.map<EditableAnswer>((answer) =>
      initAnswer(answer)
    )
    setAnswers(editableAnswers)
  }

  const addNewAnswer: EditableAnswerState['addNewAnswer'] = (path, value) => {
    setAnswers((answers) => {
      const newAnswer = initAnswer({ path, answer: value }, true, true)
      return [...answers, newAnswer]
    })
  }

  const setEditable: EditableAnswerState['setEditable'] = (id, editable) => {
    setAnswers((answers) => {
      answers[id].editable = editable
      return answers.slice()
    })
  }

  const cancelEdit: EditableAnswerState['cancelEdit'] = (id) => {
    setAnswers((answers) => {
      const answer = answers[id]
      if (answer.isNew) {
        delete answers[id]
      } else {
        answers[id] = initAnswer(answers[id].originalAnswer)
      }
      return answers.slice().filter(Boolean)
    })
  }

  const setEditedPath: EditableAnswerState['setEditedPath'] = (
    id,
    key,
    value
  ) => {
    setAnswers((answers) => {
      answers[id].editedAnswer.path[key] = value
      return answers.slice()
    })
    setEditedPathMatchesExistingPath(checkEditedPathMatchesExistingPath(id))
  }

  const setEditedValue: EditableAnswerState['setEditedValue'] = (
    id,
    newValue
  ) => {
    setAnswers((answers) => {
      answers[id].editedAnswer.value = newValue
      return answers.slice()
    })
  }

  const saveAnswer: EditableAnswerState['saveAnswer'] = async (id) => {
    const { originalAnswer, editedAnswer, isNew } = answers[id]
    const pathChanged =
      !comparePath.exact(editedAnswer.path, originalAnswer.path) && !isNew
    const existingAnswers = await backend.answer(editedAnswer.path)
    const pathConflict = existingAnswers?.[0]?.matchType === 'exact'

    if (pathChanged && pathConflict) {
      tempErrorMessage(id, "Can't overwrite an existing path.", 2000)
      return
    } else if (isNew && pathConflict) {
      tempErrorMessage(id, "Can't overwrite an existing path.", 2000)
      return
    } else if (pathChanged) {
      const answerForSave = {
        answer: backend.answerValue.prepForSave(editedAnswer.value),
        path: editedAnswer.path,
      }
      const savedAnswer = await backend.save(answerForSave)
      await backend.deleteAnswer(originalAnswer.path)
      setAnswers((answers) => {
        answers[id] = initAnswer(savedAnswer)
        return structuredClone(answers)
      })
    } else if (!pathChanged) {
      const answerForSave = {
        answer: backend.answerValue.prepForSave(editedAnswer.value),
        path: editedAnswer.path,
      }
      const savedAnswer = await backend.save(answerForSave)

      setAnswers((answers) => {
        answers[id] = initAnswer(savedAnswer)
        return structuredClone(answers)
      })
    }
  }

  const deleteAnswer: EditableAnswerState['deleteAnswer'] = async (id) => {
    const { originalAnswer, isNew } = answers[id]
    if (!isNew) {
      await backend.deleteAnswer(originalAnswer.path)
      setAnswers((answers) => {
        delete answers[id]
        return answers.slice().filter(Boolean)
      })
    }
  }

  const checkEditedPathMatchesExistingPath = (id: number): boolean => {
    return answers.some((answer, index) => {
      return (
        id != index &&
        comparePath.exact(
          answers[id].editedAnswer.path,
          answer.originalAnswer.path
        )
      )
    })
  }

  return {
    answers,
    cancelEdit,
    init,
    setEditable,
    setEditedPath,
    setEditedValue,
    editedPathMatchesExistingPath,
    saveAnswer,
    addNewAnswer,
    deleteAnswer,
  }
}
