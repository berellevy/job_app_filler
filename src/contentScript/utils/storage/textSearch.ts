// import { getAnswers106 } from "./answers106"
// import { parseKey } from "./utils"
// import elasticlunr from "elasticlunr"

// const convertAnswersFrom106ToAOO = (answers) => {
//   let counter = 0
//   const newAnswers = []
//   Object.entries(answers).forEach(([path, answer], index) => {
//     if (Array.isArray(answer)) {
//       answer.forEach((singleAnswer) => {
//         newAnswers.push({
//           id: counter++,
//           answer: singleAnswer,
//           ...parseKey(path)
//         })
//       })
//     } else {
//       newAnswers.push({
//         id: counter++,
//         answer: answer,
//         ...parseKey(path)
//       })
//     }
//   })
//     return newAnswers
// }

// type TsDoc = {
//   id: any
//   fieldName: any
//   // fieldType: string
//   // section: string
// }

// const index = elasticlunr<TsDoc>()
//   .addField("fieldName")
//   .addField("id")



// export const tsMigrate = async () => {
//   const ogAnswers = await getAnswers106()
//   const answers = convertAnswersFrom106ToAOO(ogAnswers)
//   console.time("timer")
//   answers.forEach((answer) => {
//     const {id, fieldName} = answer
//     index.addDoc({id, fieldName})
//   })
//   const questions = [
//     "How Did You Hear About Us?",
//     "How many years of hands on experience have you had?",
//     "Please select your gender.",
//     "I am:",
//     "Do you have the capability to successfully Work From Home if required (i.e. internet access, dedicated phone line, secured working area, etc.)*",
//     "Are you a party to an agreement with another person or company that may restrict your ability to work for a Voya Company?*",
//     "If yes, provide the nature of this relationship",
//     "If yes, provide the nature of this relationship (i.e. immediate family, marriage or domestic partnership, or extended family); if no, enter “N/A”:*",
//     "If yes, provide relative's name(s); if no, enter:*",
//     "Do you have a familial or romantic relationship with a current employee of any of the Voya companies? Familial relationships include (i) immediate family (current or former spouse, domestic partner, child of domestic partner, child, stepchild, parent, step-parent, sister, half-or step-sister, brother, half-or step brother, grandparent, grandchild, foster relationships); (ii) by marriage or domestic partnership (son-in-law, daughter-in-law, mother-in-law, father-in-law, brother-in-law, or sister-in-law, or equivalent thereof by domestic partnership); and (iii) extended family (niece, nephew, cousin, uncle and aunt, or equivalent thereof by domestic partnership).*",
//     `Will you now or in the future require sponsorship for an immigration-related employment benefit? (For purposes of this question “sponsorship for an immigration-related employment benefit” includes an H-1B visa petition, an O-1 visa petition, an E-3 visa petition, and TN status)*`,
//     `Are you legally authorized to work in the United States? If you are offered a position, you will be required to provide proof of your identity and eligibility to work in the United States as a condition of employment.*`,
//     `My salary expectations are (please select a range):*`,
//     `I am willing to relocate:*`,
//     `My Degree:*`,
//     `I am 18 years or older:*`,
//     `I am:*`,
//     `Have you previously been employed by Voya Financial?*`,
//     `I willingly accept the Terms and Conditions for submitting an application with Magnite.*`,
//     `Please select the veteran status which most accurately describes how you identify yourself.`,
//     `Please select the ethnicity which most accurately describes how you identify yourself.`,
//     `Please select your gender.`,
//   ]
//   questions.forEach((q) => {
//     const results = index.search(q)
//     console.log(q, results.map((res) => {
//       const id= parseInt(res.ref)
//       res["doc"] = answers[id]
//       return [res, res["doc"]["fieldName"]]
//     }));
//   })
//   console.timeEnd("timer")
  

  
  
// }