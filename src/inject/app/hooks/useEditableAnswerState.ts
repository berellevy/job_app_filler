import { useState } from 'react'
import { sleep } from '@src/shared/utils/async'
import { Answer, FieldPath } from '@src/shared/utils/types'
import { BaseFormInput } from '../services/formFields/baseFormInput'
import { contentScriptAPI } from '../services/contentScriptApi'

export type EditableAnswerState = {
  answers: EditableAnswer[]
  initAnswer?: (
    originalAnswer: Answer & { id?: number | string },
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
  id: number
}

let newAnswerKeyCounter = -1

export const useEditableAnswerState = (
  backend: BaseFormInput<any>
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
      answers.find((a) => a.id === id).error = errorMessage
      return answers.map((answer) => {
        if (answer.id === id) {
          answer.error = errorMessage
        }
        return answer
      })
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
    const id = isNew ? newAnswerKeyCounter-- : originalAnswer.id
    return {
      id,
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
      return answers.map((answer) => {
        if (answer.id === id) {
          answer.editable = editable
        }
        return answer
      })
    })
  }

  /**
   * delete if answer is new
   * re-init if answer is existing
   */
  const cancelEdit: EditableAnswerState['cancelEdit'] = (id) => {
    setAnswers((answers) => {
      return answers
        .map((answer) => {
          if (answer.id === id) {
            if (answer.isNew) {
              return null
            } else {
              return initAnswer(answer.originalAnswer)
            }
          }
          return answer
        })
        .filter(Boolean)
    })
  }

  const setEditedPath: EditableAnswerState['setEditedPath'] = (
    id,
    key,
    value
  ) => {
    setAnswers((answers) => {
      return answers.map((answer) => {
        if (answer.id === id) {
          answer.editedAnswer.path[key] = value
        }
        return answer
      })
    })
  }

  const setEditedValue: EditableAnswerState['setEditedValue'] = (
    id,
    newValue
  ) => {
    setAnswers((answers) => {
      return answers.map((answer) => {
        if (answer.id === id) {
          answer.editedAnswer.value = newValue
        }
        return answer
      })
    })
  }

  const saveAnswer: EditableAnswerState['saveAnswer'] = async (id) => {
    const { editedAnswer, isNew } = answers.find((a) => a.id === id)
    const answerForSave = {
      answer: backend.answerValue.prepForSave(editedAnswer.value),
      path: editedAnswer.path,
    }
    const method = isNew ? 'addAnswer' : 'updateAnswer'
    const answer = isNew ? { ...answerForSave } : { ...answerForSave, id }
    const resp = await contentScriptAPI.send(method, answer)
    if (resp.ok) {
      const newAnswer = initAnswer(resp.data)
      setAnswers((answers) => {
        let updatedAnswers = [...answers]
        const existingIndex = answers.findIndex((answer) => answer.id === newAnswer.id)
        if (existingIndex === -1) {
          updatedAnswers.push(newAnswer)
        } else {
          updatedAnswers[existingIndex] = newAnswer
        }
        if (isNew) {
          updatedAnswers = updatedAnswers.filter((a) => a.id !== id)
        }
        return updatedAnswers
      })
    }
  }

  const deleteAnswer: EditableAnswerState['deleteAnswer'] = async (id) => {
    const resp = await contentScriptAPI.send('deleteAnswer', id)
    if (resp.ok && resp.data) {
      setAnswers((answers) => {
        return answers.filter((answer) => {
          return !(answer.id === id)
        })
      })
    }
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
