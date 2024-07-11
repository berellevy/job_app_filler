import { Server } from "../utils/interContextServer";
import { getAnswer, saveAnswer } from "../utils/storage";
import { CONTENT_SCRIPT_URL } from "../utils/urls";
import { FieldSnapshot } from "../workday/baseFormInput";


// Regiser server and methods accessible to injected script.
const server = new Server(CONTENT_SCRIPT_URL)
server.register('saveAnswer', async (fieldSnapshot: FieldSnapshot) => {
  return await saveAnswer(fieldSnapshot)
})

server.register("getAnswer", async (FieldPath) => {
  const answer =  await getAnswer(FieldPath);
  return answer
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
