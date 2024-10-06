
import { RegisterInputs } from '../formFields/workday'

const run = async () => {
  const observer = new MutationObserver(async (_) => {
    RegisterInputs(document)
  })
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
  RegisterInputs(document)
}

run()