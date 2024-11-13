import { RegisterInputs as workday } from '../formFields/workday'
import { RegisterInputs as greenhouse } from '../formFields/greenhouse'
import { RegisterInputs as greenhouseReact } from '../formFields/greenhouseReact'

type InputSetup = (node: Node) => Promise<void>
const inputRegistrars: [string, InputSetup][] = [
  ['myworkdayjobs.com', workday],
  ['myworkdaysite.com', workday],
  ['job-boards.greenhouse.io', greenhouseReact],
  ['boards.greenhouse.io', greenhouse],
]
const getRegisterInput = (domain: string): InputSetup => {
  return inputRegistrars.find((site) => {
    return domain.endsWith(site[0])
  })[1]
}

const run = async () => {
  const RegisterInputs = getRegisterInput(window.location.host)
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
    document.removeEventListener('visibilitychange', f)
  }
  document.addEventListener('visibilitychange', f)
}
