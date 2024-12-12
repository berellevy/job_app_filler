import { Client } from "@src/shared/utils/crossContextCommunication/client";
import AnswerDTO from "./DTOs/AnswerDTO";
import { Answer, FieldPath } from "@src/shared/utils/types";
const client = new Client(process.env.CONTENT_SCRIPT_URL)

function convert106ToDTO(record: Answer): AnswerDTO {
    const {answer, id, matchType, path: {section, fieldName, fieldType}} = record
    return new AnswerDTO({answer, id, matchType, section, fieldName, fieldType})
}

const addAnswer = async (newAnswer: any) => {
    const resp = await client.send("addAnswer", newAnswer)
    if (resp.ok) {
        resp.data = convert106ToDTO(resp.data)
    }
    return resp
}

const updateAnswer = async (answer: any) => {
    const resp = await client.send("updateAnswer", answer)
    if (resp.ok) {
        resp.data = convert106ToDTO(resp.data)
    }
    return resp
}

const getAnswers = async (path: FieldPath) => {
    const resp = await client.send("getAnswer", path)
    if (resp.ok) {
        resp.data = resp.data.map(convert106ToDTO)
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