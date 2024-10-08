import { Server } from '../utils/crossContextCommunication/server'
// import { saveAnswer, getAnswer, deleteAnswer } from '../utils/storage'
import {
  convert1010To106,
  convert106To1010,
} from '../utils/storage/DataStore'
import { SavedAnswer } from '../utils/storage/DataStoreTypes'
import { FieldPath, Answer } from '../utils/types'
import { answers1010, migrate1010 } from './Answers1010'
import { EVENT_LISTENER_ID, loadApp } from './ReactApp/App'

// Regiser server and methods accessible to injected script.
const server = new Server(process.env.CONTENT_SCRIPT_URL)
server.register('addAnswer', async (newAnswer: Answer) => {
  const answer1010 = answers1010.add(convert106To1010(newAnswer))
  return convert1010To106(answer1010)
  // const { section, fieldType, fieldName, answer, id, matchType } = answers1010.add({ answer: newAnswer.answer, ...newAnswer.path })
  // return {
  //   answer,
  //   id,
  //   matchType,
  //   path: {
  //     section,
  //     fieldType,
  //     fieldName,
  //   },
  // }
})

server.register('updateAnswer', async (newAnswer: Answer) => {
  const answer1010 = answers1010.update(
    convert106To1010(newAnswer) as SavedAnswer
  )
  return convert1010To106(answer1010)
  // const { section, fieldType, fieldName, answer, id, matchType } =
  //   answers1010.update({
  //     answer: newAnswer.answer,
  //     id: newAnswer.id,
  //     ...newAnswer.path,
  //   })
  // return {
  //   answer,
  //   id,
  //   matchType,
  //   path: {
  //     section,
  //     fieldType,
  //     fieldName,
  //   },
  // }
})

server.register('getAnswer', async (fieldPath: FieldPath) => {
  return answers1010.search(fieldPath).map((record) => convert1010To106(record))
  // return answers1010.search(fieldPath).map((record) => {
  //   const { section, fieldType, fieldName, answer, id, matchType } = record
  //   return {
  //     answer,
  //     id,
  //     matchType,
  //     path: {
  //       section,
  //       fieldType,
  //       fieldName,
  //     },
  //   }
  // })
})

server.register('deleteAnswer', async (id: number) => {
  return answers1010.delete(id)
})

// inject script
function injectScript(filePath: string) {
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL(filePath)
  script.setAttribute('async', 'true')
  script.type = 'module'
  script.onload = function () {
    script.remove()
  }
  ;(document.head || document.documentElement).appendChild(script)
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SHOW_WHATS_NEW') {
    document.dispatchEvent(new CustomEvent(EVENT_LISTENER_ID))
  }
})

const run = async () => {
  await migrate1010()
  await answers1010.load()
  injectScript('inject.js')
  loadApp()
}

run()
