import { RegisterInputs as workday } from './app/services/formFields/workday'
import { RegisterInputs as greenhouse } from './app/services/formFields/greenhouse'
import { RegisterInputs as greenhouseReact } from './app/services/formFields/greenhouseReact'
import { RegisterInputs as icims } from './app/services/formFields/icims'

type InputSetup = (node: Node) => Promise<void>
const inputRegistrars: [string, InputSetup][] = [
  ['myworkdayjobs.com', workday],
  ['myworkdaysite.com', workday],
  ['job-boards.greenhouse.io', greenhouseReact],
  ['boards.greenhouse.io', greenhouse],
  ['boards.eu.greenhouse.io', greenhouse],
  // iCIMS: tenants are served from `careers-<company>.icims.com`,
  // `jobs-<company>.icims.com`, `*.icims.community`, etc. `endsWith` on the
  // root domain covers every tenant subdomain.
  ['icims.com', icims],
]
const getRegisterInput = (domain: string): InputSetup => {
  return inputRegistrars.find((site) => {
    return domain.endsWith(site[0])
  })[1]
}

/**
 * iCIMS frequently renders the apply form inside a same-origin `<iframe>`
 * (confirmed by the iCIMS iframe handling in chandrarup/SmartApplyAI's content
 * script). The injected script runs in the top document, whose MutationObserver
 * never sees mutations inside a child frame's document. To still register
 * fields, we additionally run `RegisterInputs` against every reachable
 * same-origin iframe document and observe it for changes.
 *
 * Cross-origin iframes are inaccessible from the parent for security reasons —
 * `iframe.contentDocument` throws / returns null — so those are silently
 * skipped. Chrome extension content scripts with `all_frames: true` would be
 * injected directly into such frames instead; that manifest change is the
 * proper fix and is flagged as a GAP below.
 *
 * GAP (needs live verification): whether a given iCIMS tenant serves its apply
 * form same-origin (handled here) or cross-origin (needs `all_frames` in the
 * content-script manifest) was not verifiable against a live authenticated
 * apply page, since iCIMS gates anonymous DOM inspection. The same-origin path
 * is implemented; the cross-origin manifest path is documented, not faked.
 */
const registerInSameOriginFrames = (RegisterInputs: InputSetup): void => {
  const frames = Array.from(document.querySelectorAll('iframe'))
  frames.forEach((frame) => {
    let frameDoc: Document | null = null
    try {
      frameDoc = frame.contentDocument
    } catch {
      // Cross-origin frame — not reachable from the parent document.
      frameDoc = null
    }
    if (!frameDoc?.body) {
      return
    }
    RegisterInputs(frameDoc)
    const frameObserver = new MutationObserver(() => {
      RegisterInputs(frameDoc as Document)
    })
    frameObserver.observe(frameDoc.body, {
      childList: true,
      subtree: true,
    })
  })
}

const run = async () => {
  const RegisterInputs = getRegisterInput(window.location.host)
  const isIcims = window.location.host.endsWith('icims.com')
  const observer = new MutationObserver(async (_) => {
    RegisterInputs(document)
    if (isIcims) {
      registerInSameOriginFrames(RegisterInputs)
    }
  })
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
  RegisterInputs(document)
  if (isIcims) {
    registerInSameOriginFrames(RegisterInputs)
  }
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
