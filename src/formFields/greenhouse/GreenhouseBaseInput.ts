import { createRoot } from 'react-dom/client'
import { BaseFormInput } from '../baseFormInput'


export abstract class GreenhouseBaseInput<
  AnswerType
> extends BaseFormInput<AnswerType> {

  /**
   * also needed to insert before
   */
  abstract inputElement(): HTMLInputElement
  /**
   * Attach widget between label and field
   */
  attachReactApp(
    app: React.ReactNode,
    inputContainer: HTMLElement
  ) {
    const rootElement = document.createElement('div')
    if (this.inputElement) {
      this.inputElement()?.parentElement.insertBefore(rootElement, this.inputElement())
      createRoot(rootElement).render(app)
    }
    // const labelParentElement = labelElement.parentElement
    

  }

}