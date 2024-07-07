import { getElements } from '../utils/getElements'

export class TextInput {
  element: HTMLElement
  constructor(element: HTMLElement) {
    this.element = element
    element.setAttribute('job-app-filler', '')
  }

  get page(): string {
    return 'hello'
  }
}
export const FORM_TEXT_INPUT = `
.//div
[starts-with(@data-automation-id, 'formField-')]
[.//input[@type='text'] or .//input[@type='password']]
[not(.//*[@aria-haspopup])]
`

export const RegisterTextInputs = (node: Node) => {
  const elements = getElements(node, FORM_TEXT_INPUT)
  elements.forEach((el) => {
    if (!el.hasAttribute('job-app-filler')) {
      const input = new TextInput(el)
      console.log(input)
    }
  })
}
