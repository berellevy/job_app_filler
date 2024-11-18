import fieldFillerQueue from '../../utils/fieldFillerQueue'
import { getElement } from '../../utils/getElements'

import { getReactProps } from '../utils'
import { WorkdayBaseInput } from './workdayBaseInput'
import * as xpaths from './xpaths'

export class TextArea extends WorkdayBaseInput<string | null> {
  static XPATH = xpaths.TEXT_AREA
  fieldType = 'TextInput'
  private internalValue: string | null

  inputElement(): HTMLInputElement {
    return getElement(this.element, './/textarea') as HTMLInputElement
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
      setTimeout(() => this.listenForChanges(), 0)
    }
    this.element.addEventListener('input', callback)
    this.inputElement().addEventListener('blur', callback)
  }

  currentValue(): string | null {
    return this.internalValue
  }

  public isFilled(current: any, stored: any[]): boolean {
    return current===stored[0]
  }

  /**
   * TODO: explain
   */
  async fill(): Promise<void> {
    const answer = await this.answer()
    if (answer.length > 0) {
      await fieldFillerQueue.enqueue(async () => {
        const reactProps = getReactProps(this.inputElement())
        reactProps.onBlur({ target: { value: answer[0].answer } })
        this.internalValue = answer[0].answer
      })
    }
    setTimeout(() => {
      this.triggerReactUpdate()
    }, 0)
  }
}
