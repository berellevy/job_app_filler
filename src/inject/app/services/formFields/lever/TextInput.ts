import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import { getElement } from '@src/shared/utils/getElements'
import { LeverBaseInput } from './LeverBaseInput'
import { xpaths } from './xpaths'

/**
 * Standard Lever text input — covers the basic candidate fields
 * (`name`, `email`, `org`). Each is registered as its own adapter
 * instance via the discriminated XPaths below so the React widget
 * can label the saved answer correctly per field.
 */
abstract class LeverTextInputBase extends LeverBaseInput<string> {
  abstract inputName: string

  inputElement(): HTMLInputElement {
    return getElement(
      this.element,
      `.//input[@name="${this.inputName}"]`
    ) as HTMLInputElement
  }

  listenForChanges(): void {
    this.inputElement()?.addEventListener('input', () => {
      this.triggerReactUpdate()
    })
  }

  currentValue(): string {
    return this.inputElement()?.value || ''
  }

  async fill(): Promise<void> {
    const answers = await this.answer()
    const input = this.inputElement()
    if (!input || answers.length === 0) {
      return
    }
    const firstAnswer = answers[0]
    await fieldFillerQueue.enqueue(async () => {
      input.value = firstAnswer.answer
      input.dispatchEvent(new InputEvent('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
    })
  }
}

export class NameInput extends LeverTextInputBase {
  static XPATH: string = xpaths.NAME
  fieldType = 'TextInput'
  inputName = 'name'
}

export class EmailInput extends LeverTextInputBase {
  static XPATH: string = xpaths.EMAIL
  fieldType = 'TextInput'
  inputName = 'email'
}

export class OrgInput extends LeverTextInputBase {
  static XPATH: string = xpaths.ORG
  fieldType = 'TextInput'
  inputName = 'org'
}
