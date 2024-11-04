import { createRoot } from 'react-dom/client'
import { BaseFormInput } from '../baseFormInput'

export abstract class GreenhouseBaseInput<
  AnswerType
> extends BaseFormInput<AnswerType> {
  abstract inputElement(): HTMLInputElement
  /**
   * needed to display the widget before.
   */
  inputDisplayElement(): HTMLElement {
    return this.inputElement()
  }
  /**
   * Attach widget between label and field
   */
  attachReactApp(app: React.ReactNode, inputContainer: HTMLElement) {
    const rootElement = document.createElement('div')
    if (this.inputDisplayElement) {
      this.inputDisplayElement()?.parentElement.insertBefore(
        rootElement,
        this.inputDisplayElement()
      )
      createRoot(rootElement).render(app)
    }
  }
}
