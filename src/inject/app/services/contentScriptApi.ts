import { Client } from "@src/shared/utils/crossContextCommunication/client";
import AnswerDTO from "./DTOs/AnswerDTO";
import { Answer106, FieldPath } from "@src/shared/utils/types";
const client = new Client(process.env.CONTENT_SCRIPT_URL)

const addAnswer = async (newAnswer: any, DTOClass: typeof AnswerDTO) => {
    const resp = await client.send("addAnswer", newAnswer)
    if (resp.ok) {
        resp.data = DTOClass.from106(newAnswer)
    }
    return resp
}

const updateAnswer = async (answer: any, DTOClass: typeof AnswerDTO) => {
    const resp = await client.send("updateAnswer", answer)
    if (resp.ok) {
        resp.data = DTOClass.from106(resp.data)
    }
    return resp
}

const getAnswers = async (path: FieldPath, DTOClass: typeof AnswerDTO) => {
    const resp = await client.send("getAnswer", path)
    if (resp.ok) {
        resp.data = resp.data.map((a: Answer106) => DTOClass.from106(a))
    }
    return resp
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