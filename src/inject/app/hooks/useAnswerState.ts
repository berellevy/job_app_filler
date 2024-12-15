import { useEffect, useState } from "react"
import AnswerDTO from "../services/DTOs/AnswerDTO"
import { BaseFormInput } from "../services/formFields/baseFormInput"
import contentScriptAPI from "../services/contentScriptApi"

export type NewAnswerParams = {
    section: string
    question: string
    answer: string
}

export type ExistingAnswerParams = {
    id: number
} & NewAnswerParams

export type AnswerState = {
    data: AnswerDTO[]
    initialized: boolean
}

export type AnswerActions = {
    add: (newAnswer: NewAnswerParams) => Promise<void>
    update: (answer: ExistingAnswerParams) => Promise<void>
    deleteAnswer: (id: number) => Promise<void>
}



export default function useAnswerState(backend: BaseFormInput): AnswerState & AnswerActions {
    const [state, setState] = useState<AnswerState>({data: [], initialized: false})
    const init = async () => {
        const answers = await contentScriptAPI.getAnswers({
            section: backend.section,
            fieldName: backend.fieldName,
            fieldType: backend.fieldType,
        }, backend.answerDTOClass)
        setState((initialState) => ({
            ...initialState,
            data: answers,
            initialized: true

        }))
    }
    useEffect(() => {
        init()
    },[])
    const add = async ({ section, question, answer }: NewAnswerParams) => {
        
    }

    const update = async ({ id, section, question, answer }: ExistingAnswerParams) => {

    }

    const deleteAnswer = async (id: number) => {

    }
    return {

        ...state,
        add,
        update,
        deleteAnswer,
    }
}