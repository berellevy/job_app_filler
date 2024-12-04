import { DataStore } from "./DataStore"
import { parseKey } from "./utils"




const ANSWERS1010 = "answers1010"

export const migrate1010 = async () => {
  const localStorageAll = await chrome.storage.local.get()
  if (!("answers106" in localStorageAll) ) {
    return 
  }
  if (ANSWERS1010 in localStorageAll) {
    return 
  }
  const answers1010 = new DataStore(ANSWERS1010)
  await answers1010.load()
  Object.entries(localStorageAll['answers106']).forEach(([path, answer]) => {
    answers1010.add({
      answer: answer,
      ...parseKey(path),
    })
  })
}

export const answers1010 = new DataStore(ANSWERS1010)
