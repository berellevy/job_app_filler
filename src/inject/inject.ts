
import { Client } from '../utils/interContextServer'
import { CONTENT_SCRIPT_URL } from '../utils/urls'
import { RegisterInputs } from '../workday/textInput'

export const client = new Client(CONTENT_SCRIPT_URL)

const observer = new MutationObserver(async (_) => {
  RegisterInputs(document)
})
observer.observe(document.body, {
  childList: true,
  subtree: true,
})

