import { useEffect, useState } from "react"
import AnswerDTO from "../services/DTOs/AnswerDTO"
import { BaseFormInput } from "../services/formFields/baseFormInput"
import contentScriptAPI from "../services/contentScriptApi"

export type NewAnswerParams = {
  answer: string
}

export type ExistingAnswerParams = {
  id: number
}

export type AnswerState = {
  data: AnswerDTO[]
  initialized: boolean
}

export type AnswerActions = {
  add: (answer: string) => Promise<void>
  update: (answer: ExistingAnswerParams) => Promise<void>
  deleteAnswer: (id: number) => Promise<void>
}


export default function useAnswerState(backend: BaseFormInput): AnswerState & AnswerActions {
  const [state, setState] = useState<AnswerState>({ data: [], initialized: false })

  const {section, fieldName, fieldType, answerDTOClass} = backend 

  async function getAnswers(): Promise<AnswerDTO[]> {
    return await contentScriptAPI.getAnswers(
      { section, fieldName, fieldType }, answerDTOClass
    )
  }

  const init = async () => {
    const answers = await getAnswers()
    setState((initialState) => ({
      ...initialState,
      data: answers,
      initialized: true
    }))
  }

  useEffect(() => {init()}, [])

  const refresh = async () => {
    const data = await getAnswers()
    setState((initialState) => ({
      ...initialState,
      data
    }))
  }

  const add = async (answer: string) => {
    const result = await contentScriptAPI.addAnswer(
      {section, fieldType, question: fieldName, answer},
      answerDTOClass
    )
    if (result.ok) {
      await refresh()
    }
  }

  const update = async ({ id }: ExistingAnswerParams) => {

  }

  const deleteAnswer = async (id: number) => {
    const resp = await contentScriptAPI.deleteAnswer(id)
    if (resp.ok) {
      setState(({ data, ...rest }) => ({
        data: data.filter((a) => a.id !== id),
        ...rest
      }))
    }
  }
  return {

    ...state,
    add,
    update,
    deleteAnswer,
  }
}