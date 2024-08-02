import { sleep } from '../../utils/async'
import fieldFillerQueue from '../../utils/fieldFillerQueue'
import { getElement } from '../../utils/getElements'
import { getReactProps } from '../baseFormInput'
import { WorkdayBaseInput } from './workdayBaseInput'
import * as xpaths from './xpaths'

export class TextInput extends WorkdayBaseInput<string | null> {
  static XPATH = xpaths.TEXT_INPUT
  fieldType = 'TextInput'
  private internalValue: string | null

  inputElement(): HTMLInputElement {
    return getElement(this.element, './/input') as HTMLInputElement
  }

  /**
   * TODO: explain
   */
  listenForChanges() {
    const callback = (e) => {
      this.triggerReactUpdate()
      this.element.removeEventListener('input', callback)
      this.inputElement().removeEventListener('blur', callback)
      this.internalValue = e.target.value
      sleep(10).then(() => this.listenForChanges())
    }

    this.element.addEventListener('input', callback)
    this.inputElement().addEventListener('blur', callback)
  }

  currentValue(): string | null {
    return this.internalValue
  }

  /**
   * TODO: explain
   */
  async fill() {
    if (!(await this.isFilled()) && (await this.hasAnswer())) {
      await fieldFillerQueue.enqueue(async () => {
        const answer = await this.answer()
        const reactProps = getReactProps(this.inputElement())
        if (reactProps.onChange) {
          reactProps.onChange({ target: { value: answer } })
        } else if (reactProps.onBlur) {
          reactProps.onBlur({ target: { value: answer } })
        }
        this.internalValue = answer
        await sleep(100)
      })
    }
  }
}

export class PasswordInput extends WorkdayBaseInput<string | null> {
  static XPATH = xpaths.PASSWORD_INPUT
  fieldType = 'PasswordInput'

  inputElement(): HTMLInputElement {
    return getElement(this.element, './/input') as HTMLInputElement
  }

  currentValue() {
    return this.inputElement().value
  }

  listenForChanges() {
    this.inputElement().addEventListener('input', (e) => {
      this.triggerReactUpdate()
    })
  }

  async fill() {
    if (await this.hasAnswer()) {
      const answer = await this.answer()
      const reactProps = getReactProps(this.inputElement())
      reactProps.onChange({ target: { value: answer } })
    }
  }
}
