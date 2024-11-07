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

/**
 * Prevent the injected script from running until the tab is revealed.
 * For example, when you open multiple tabs at once.
 */
if (!document.hidden) {
  run()
} else {
  const f = () => {
    run()
    document.removeEventListener("visibilitychange", f)
  }
  document.addEventListener("visibilitychange", f)
}