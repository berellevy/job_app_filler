import { getElement } from "@src/shared/utils/getElements"


export class CheckboxWrapperContainer {
  element: HTMLElement
  constructor(element: HTMLElement) {
    this.element = element
  }

  get labelElement(): HTMLLabelElement {
    return getElement(this.element, `.//label`) as HTMLLabelElement
  }

  get value(): string {
    return this.labelElement?.innerText
  }

  get inputElement(): HTMLInputElement {
    return getElement(this.element, `.//input`) as HTMLInputElement
  }

  get checked(): boolean {
    return this.inputElement.checked
  }

  check(): void {
    this.checked || this.inputElement.click()
  }

  uncheck(): void {
    this.checked && this.inputElement.click()
  }
}