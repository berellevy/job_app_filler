import { createRoot } from 'react-dom/client'
import { BaseFormInput } from '../baseFormInput'

export abstract class GreenhouseReactBaseInput<
  AnswerType
> extends BaseFormInput<AnswerType> {
  get labelDisplayElement(): HTMLElement {
    return this.labelElement
  }
  abstract get labelElement(): HTMLElement

  attachReactApp(app: React.ReactNode, inputContainer: HTMLElement): void {
    const rootElement = document.createElement('div')
    rootElement.classList.add('jaf-widget')
    this.labelDisplayElement.insertAdjacentElement('afterend', rootElement)
    createRoot(rootElement).render(app)
  }
}
