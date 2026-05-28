import {
  buildFeedbackTarget,
  buildStableCssPath,
} from './pageTarget'

const root = document.createElement('main')
root.innerHTML = `
  <section class="job-card featured">
    <button class="apply primary">Apply now</button>
  </section>
`

const button = root.querySelector('button')!
const path = buildStableCssPath(button)
const target = buildFeedbackTarget(button)

if (path !== 'main > section.job-card.featured > button.apply.primary') {
  throw new Error(`Unexpected selector: ${path}`)
}

if (target.text !== 'Apply now') {
  throw new Error(`Unexpected target text: ${target.text}`)
}
