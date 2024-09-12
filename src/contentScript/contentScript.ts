import { Server } from '../utils/crossContextCommunication/server'
import { saveAnswer, getAnswer, deleteAnswer } from '../utils/storage'

import { FieldPath, Answer } from '../utils/types'
import { EVENT_LISTENER_ID, loadApp } from './ReactApp/App'

// Regiser server and methods accessible to injected script.
const server = new Server(process.env.CONTENT_SCRIPT_URL)
server.register('saveAnswer', async (answer: Answer) => {
  return await saveAnswer(answer)
})

server.register('getAnswer', async (fieldPath: FieldPath) => {
  const answer = await getAnswer(fieldPath)
  return answer
})

server.register('deleteAnswer', async (fieldPath: FieldPath) => {
  return await deleteAnswer(fieldPath)
})

// inject script
function injectScript(filePath: string) {
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL(filePath)
  script.type = 'module'
  script.onload = function () {
    script.remove()
  }
  ;(document.head || document.documentElement).appendChild(script)
}

injectScript('inject.js')

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SHOW_WHATS_NEW') {
    document.dispatchEvent(new CustomEvent(EVENT_LISTENER_ID))
  }
})

loadApp()
