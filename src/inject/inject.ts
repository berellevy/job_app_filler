import { RegisterInputs } from '../workday/textInput'
const observer = new MutationObserver(async (_) => {
  RegisterInputs(document)
})
observer.observe(document.body, {
  childList: true,
  subtree: true,
})

