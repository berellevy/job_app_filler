
import { Client } from '../utils/crossContextCommunication'
import { RegisterInputs } from '../workday/textInput'

export const client = new Client(process.env.CONTENT_SCRIPT_URL)



const observer = new MutationObserver(async (_) => {
  RegisterInputs(document)
})
observer.observe(document.body, {
  childList: true,
  subtree: true,
})

