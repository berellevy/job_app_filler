import fieldFillerQueue from '../../utils/fieldFillerQueue'
import { getElement } from '../../utils/getElements'
import { AnswerDisplayType } from '../../utils/types'
import { getReactProps } from '../baseFormInput'
import { WorkdayBaseInput } from './workdayBaseInput'
import * as xpaths from './xpaths'

export class TextArea extends WorkdayBaseInput<string | null> {
  static XPATH = xpaths.TEXT_AREA
  fieldType = 'TextInput'
  private internalValue: string | null
  answerDisplayType: AnswerDisplayType = "SingleAnswerDisplay"

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

  /**
   * TODO: explain
   */
  async fill(): Promise<void> {
    const answer = await this.answer()
    if (answer.hasAnswer) {
      await fieldFillerQueue.enqueue(async () => {
        
        const answer = await this.answer()
        const reactProps = getReactProps(this.inputElement())
        reactProps.onBlur({ target: { value: answer.answer } })
        this.internalValue = answer.answer
      })
    }
    setTimeout(() => {
      this.triggerReactUpdate()
    }, 0)
  }
}
