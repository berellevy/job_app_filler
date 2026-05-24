import { getElement } from '@src/shared/utils/getElements'
import { Answer } from '@src/shared/utils/types'
import { AshbyBaseInput } from './AshbyBaseInput'
import { xpaths } from './xpaths'
import { setNativeValue } from './utils'

/**
 * Plain text / email input — covers Ashby's `_systemfield_name` and
 * `_systemfield_email` fields as well as custom free-text questions.
 */
export class TextInput extends AshbyBaseInput<string> {
  static XPATH: string = xpaths.TEXT_INPUT
  fieldType: string = 'TextInput'

  get labelElement(): HTMLElement {
    return getElement(this.element, `.//label`)
  }

  get inputElement(): HTMLInputElement {
    return getElement(this.element, `.//input`) as HTMLInputElement
  }

  listenForChanges(): void {
    this.inputElement?.addEventListener('input', () => {
      this.triggerReactUpdate()
    })
  }

  currentValue(): string {
    return this.inputElement?.value ?? ''
  }

  async fill(): Promise<void> {
    const answers: Answer[] = await this.answer()
    if (answers.length === 0) {
      return
    }
    const value = answers[0].answer as string
    setNativeValue(this.inputElement, value)
  }
}
