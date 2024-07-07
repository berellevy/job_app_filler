import { getElements } from '../utils/getElements'

export class BaseFormInput {
  static XPATH: string
  element: HTMLElement

  constructor(element: HTMLElement) {
    this.element = element
    element.setAttribute('job-app-filler', '')
  }

  static autoDiscover(node: Node = document) {
    const elements = getElements(node, this.XPATH)
    elements.forEach((el) => {
      if (!el.hasAttribute('job-app-filler')) {
        const input = new this(el)
        console.log(input);
        
      }
    })
  }
}


export class TextInput extends BaseFormInput{
  static XPATH = `
    .//div
    [starts-with(@data-automation-id, 'formField-')]
    [.//input[@type='text']]
    [not(.//*[@aria-haspopup])]
    `

  get page(): string {
    return 'hello'
  }
}


export const RegisterTextInputs = (node: Node = document) => {
  
  TextInput.autoDiscover(node)

}
