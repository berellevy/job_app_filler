import { FC } from 'react'
import { sleep } from '../../utils/async'
import fieldFillerQueue from '../../utils/fieldFillerQueue'
import { getElement, waitForElement } from '../../utils/getElements'
import { Answer} from '../../utils/types'
import { getReactProps } from '../baseFormInput'
import { WorkdayBaseInput } from './workdayBaseInput'
import * as xpaths from './xpaths'
import { AnswerValueSingleDate } from '../../components/AnswerValueDisplayComponents/AnswerValueSingleDate'


function dateCompare(date1: string[], date2: string[]): boolean {
  if (date1.length !== date2.length) {
    return false
  }
  for (let i = 0; i < date1.length; i++) {
    if (date1[i] !== date2[i]) {
      return false;
    }
  }
  return true
}

export class MonthYear extends WorkdayBaseInput<[string, string]> {
  static XPATH = xpaths.MONTH_YEAR
  fieldType = 'MonthYear'
  public answerValueDisplayComponent = AnswerValueSingleDate
  get answerValue() {
    return {
      ...super.answerValue,
      displayComponent: AnswerValueSingleDate
    }
  }
  listenForChanges(): void {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') {
          this.triggerReactUpdate()
        }
      }
    })
    observer.observe(this.wrapperElement, {
      characterData: true,
      childList: true,
      subtree: true,
    })
  }

  get monthInputElement(): HTMLInputElement {
    return getElement(
      this.element,
      ".//input[@aria-label='Month']"
    ) as HTMLInputElement
  }

  get yearInputElement(): HTMLInputElement {
    return getElement(
      this.element,
      ".//input[@aria-label='Year']"
    ) as HTMLInputElement
  }
  currentValue() {
    return [this.monthInputElement.value, this.yearInputElement.value]
  }

  get wrapperElement(): HTMLElement {
    return getElement(
      this.element,
      ".//div[@data-automation-id='dateInputWrapper']"
    )
  }

  /**
   * Compare only the first stored date.
   */
  isFilled(current: any, stored: any): boolean {
    if (stored.length <= 0) {
      return false
    }
    return dateCompare(stored[0], current)
  }

  /**
   * After calling the onKeyDown of the month and year inputs
   * we need to wait until the change is reflected. This usually happens very quickly
   * so the while loop doesn't get called too much.
   * When I tested it, the while loop was called once. (berel)
   *
   * In order to update react state properly, the input elements need to be clicked after calling the onkeydown
   * Also, sometimes, we have to send the onKeyDown event more than once for it to work
   *
   */
  async fill(answers?: any): Promise<void> {
    answers = answers || await this.answer()
    if (answers.length > 0) {
      await fieldFillerQueue.enqueue(async () => {
        const [month, year] = answers[0].answer
        this.monthInputElement.click()
        let retries = 20
        while (!(this.monthInputElement.value === month) && retries >= 0) {
          await sleep(50)
          getReactProps(this.monthInputElement).onKeyDown({
            nativeEvent: { key: 'Up', setSelectionRange: () => {} },
            preventDefault: () => {},
            currentTarget: {
              value: parseInt(month) - 1,
              setSelectionRange: () => {},
            },
          })
          retries--
        }
        this.monthInputElement.click()
        this.yearInputElement.click()
        retries = 20
        while (!(this.yearInputElement.value === year) && retries > 0) {
          await sleep(50)
          getReactProps(this.yearInputElement).onKeyDown({
            nativeEvent: { key: 'Up', setSelectionRange: () => {} },
            preventDefault: () => {},
            currentTarget: {
              value: parseInt(year) - 1,
              setSelectionRange: () => {},
            },
          })
          retries--
        }
        this.yearInputElement.click()
      })
    }
  }
}



export class Year extends WorkdayBaseInput<string> {
  static XPATH = xpaths.YEAR
  fieldType = 'Year'
  listenForChanges(): void {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') {
          this.triggerReactUpdate()
        }
      }
    })
    observer.observe(this.wrapperElement, {
      characterData: true,
      childList: true,
      subtree: true,
    })
  }

  get yearInputElement(): HTMLInputElement {
    return getElement(
      this.element,
      ".//input[@aria-label='Year']"
    ) as HTMLInputElement
  }
  currentValue() {
    return this.yearInputElement.value
  }

  get wrapperElement(): HTMLElement {
    return getElement(
      this.element,
      ".//div[@data-automation-id='dateInputWrapper']"
    )
  }

  public isFilled(current: any, stored: any[]): boolean {
    return stored[0] === current
  }

  /**
   * After calling the onKeyDown of the month and year inputs
   * we need to wait until the change is reflected. This usually happens very quickly
   * so the while loop doesn't get called too much.
   * When I tested it, the while loop was called once. (berel)
   *
   * In order to update react state properly, the input elements need to be clicked after calling the onkeydown
   * Also, sometimes, we have to send the onKeyDown event more than once for it to work
   *
   */
  async fill(): Promise<void> {
    const answers = await this.answer()
    const isFilled = this.isFilled(this.currentValue(), answers.map(a=>a.answer))
    if (answers.length > 0 && !isFilled) {
      await fieldFillerQueue.enqueue(async () => {
        const year = answers[0]?.answer
        this.yearInputElement.click()
        let retries = 20
        while (!(this.yearInputElement.value === year) && retries > 0) {
          await sleep(50)
          getReactProps(this.yearInputElement).onKeyDown({
            nativeEvent: { key: 'Up', setSelectionRange: () => {} },
            preventDefault: () => {},
            currentTarget: {
              value: parseInt(year) - 1,
              setSelectionRange: () => {},
            },
          })
          retries--
        }
        this.yearInputElement.click()
      })
    }
  }
}
