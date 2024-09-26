import { PGlite, MemoryFS} from '@electric-sql/pglite'
import { getAnswers106 } from "."
import { parseKey } from "./utils"

const convertAnswersFrom106ToAOO = (answers) => {
  let counter = 0
  const newAnswers = []
  Object.entries(answers).forEach(([path, answer], index) => {
    if (Array.isArray(answer)) {
      answer.forEach((singleAnswer) => {
        newAnswers.push({
          id: counter++,
          answer: singleAnswer,
          ...parseKey(path)
        })
      })
    } else {
      newAnswers.push({
        id: counter++,
        answer: answer,
        ...parseKey(path)
      })
    }
  })
    return newAnswers
}

export const migrateToPg = async () => {
  const answers = await getAnswers106()
  // console.log(convertAnswersFrom106ToAOO(answers));
  // const db = new PGlite({
  //   fs: new MemoryFS()
  // }) 
  // // console.log(db);
  // await db.exec(`
  //   CREATE TABLE IF NOT EXISTS answers (
  //     id SERIAL PRIMARY KEY,
  //     name TEXT
  //   );
  //   INSERT INTO answers (name) VALUES ("hello")
  // `)

  //   const res = await db.query(`
  //     select * from answers
  //   `)
  //   console.log("hello",res.rows);
}