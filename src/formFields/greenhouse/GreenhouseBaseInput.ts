import { createRoot } from 'react-dom/client'
import { BaseFormInput } from '../baseFormInput'
import { getElement } from '../../utils/getElements'

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

  public get fieldName() {
    return super.fieldName?.replace("j\n\na\n\nf", "")
  }

  sectionElement(): HTMLElement {
    return getElement(
      this.element,
      `ancestor::div[@jaf-section]`
    )
  }

  get section(): string {
    return this.sectionElement()?.getAttribute('jaf-section') || ""
  }
  /**
   * Attach widget between label and field
   */
  attachReactApp(app: React.ReactNode, inputContainer: HTMLElement) {
    const rootElement = document.createElement('div')
    rootElement.classList.add("jaf-widget")
    if (this.inputDisplayElement) {
      this.inputDisplayElement()?.parentElement.insertBefore(
        rootElement,
        this.inputDisplayElement()
      )
      createRoot(rootElement).render(app)
    }
  }
}
