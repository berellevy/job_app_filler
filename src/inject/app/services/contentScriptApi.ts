import { Client } from "@src/shared/utils/crossContextCommunication/client";
import AnswerDTO from "./DTOs/AnswerDTO";
import { Answer106, FieldPath, ResponseBody } from "@src/shared/utils/types";


const client = new Client(process.env.CONTENT_SCRIPT_URL)

type NewAnswer = { question: string, answer: any, section: string, fieldType: string }

const addAnswer = async (newAnswer: NewAnswer, DTOClass: typeof AnswerDTO) => {
    const {section, question, answer, fieldType} = newAnswer
    const resp = await client.send("addAnswer", {
        answer,
        path: {
            fieldType,
            section, 
            fieldName: question
        }
    })
    if (resp.ok) {
        resp.data = DTOClass.from106(resp.data)
    }
    return resp
}


const updateAnswer = async (answer: any, DTOClass: typeof AnswerDTO): Promise<ResponseBody<AnswerDTO>> => {
    const resp = await client.send("updateAnswer", answer)
    if (resp.ok) {
        resp.data = DTOClass.from106(resp.data)
    }
    return resp
}

const getAnswers = async (path: FieldPath, DTOClass: typeof AnswerDTO): Promise<AnswerDTO[]> => {
    const resp = await client.send("getAnswer", path)
    if (!resp.ok) {
        console.error({ resp, path })
        return []
    }
    return resp.data.map((a: Answer106) => DTOClass.from106(a))
}

const deleteAnswer = async (id: number) => {
    return await client.send("deleteAnswer", id)
}

const contentScriptAPI = {
    addAnswer,
    deleteAnswer,
    updateAnswer,
    getAnswers,
}
export default contentScriptAPI