import { RegisterInputs as workday } from '../formFields/workday'
import { RegisterInputs as greenhouse } from '../formFields/greenhouse'
const inputSetups = {
  "myworkdayjobs.com": workday,
  "myworkdaysite.com": workday,
  "greenhouse.io": greenhouse
}

const run = async () => {
  const domain = window.location.host.split('.').slice(-2).join(".")
  const RegisterInputs = inputSetups[domain]
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