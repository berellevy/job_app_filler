import { RegisterInputs as workday } from './app/services/formFields/workday'
import { RegisterInputs as greenhouse } from './app/services/formFields/greenhouse'
import { RegisterInputs as greenhouseReact } from './app/services/formFields/greenhouseReact'
import { RegisterInputs as lever } from './app/services/formFields/lever'
import { RegisterInputs as ashby } from './app/services/formFields/ashby'
import { RegisterInputs as smartrecruiters } from './app/services/formFields/smartrecruiters'
import { RegisterInputs as workable } from './app/services/formFields/workable'

type InputSetup = (node: Node) => Promise<void>
const inputRegistrars: [string, InputSetup][] = [
  ['myworkdayjobs.com', workday],
  ['myworkdaysite.com', workday],
  ['job-boards.greenhouse.io', greenhouseReact],
  ['boards.greenhouse.io', greenhouse],
  ['boards.eu.greenhouse.io', greenhouse],
  ['jobs.lever.co', lever],
  ['jobs.ashbyhq.com', ashby],
  ['jobs.smartrecruiters.com', smartrecruiters],
  ['apply.workable.com', workable],
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
