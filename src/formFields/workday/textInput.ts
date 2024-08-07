import { sleep } from '../../utils/async'
import fieldFillerQueue from '../../utils/fieldFillerQueue'
import { getElement } from '../../utils/getElements'
import { AnswerDisplayType } from '../../utils/types'
import { getReactProps } from '../baseFormInput'
import { WorkdayBaseInput } from './workdayBaseInput'
import * as xpaths from './xpaths'

export class TextInput extends WorkdayBaseInput<string | null> {
  static XPATH = xpaths.TEXT_INPUT
  fieldType = 'TextInput'
  answerDisplayType: AnswerDisplayType = "SingleAnswerDisplay"
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
    const answer = await this.answer()
    if (answer?.hasAnswer && !(await this.isFilled(answer))) {
      await fieldFillerQueue.enqueue(async () => {
        const reactProps = getReactProps(this.inputElement())
        if (reactProps.onChange) {
          reactProps.onChange({ target: { value: answer.answer } })
        } else if (reactProps.onBlur) {
          reactProps.onBlur({ target: { value: answer.answer } })
        }
        this.internalValue = answer.answer
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
    const answer = await this.answer()
    if (answer.hasAnswer) {
      const reactProps = getReactProps(this.inputElement())
      reactProps.onChange({ target: { value: answer.answer } })
    }
  }
}
