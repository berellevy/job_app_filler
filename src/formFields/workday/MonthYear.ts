import { sleep } from '../../utils/async'
import fieldFillerQueue from '../../utils/fieldFillerQueue'
import { getElement, waitForElement } from '../../utils/getElements'
import { getReactProps } from '../baseFormInput'
import { WorkdayBaseInput } from './workdayBaseInput'
import * as xpaths from './xpaths'

export class MonthYear extends WorkdayBaseInput<[string, string]> {
  static XPATH = xpaths.MONTH_YEAR
  fieldType = 'MonthYear'
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

  /**can't compare arrays in js :/ */
  async isFilled(): Promise<boolean> {
    const [answerMonth, answerYear] = (await this.answer()) || ['', '']
    const [currentValueMonth, currentValueYear] = this.currentValue()
    return answerMonth === currentValueMonth && answerYear === currentValueYear
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
    if ((await this.hasAnswer()) && !(await this.isFilled())) {
      // await sleep(1000)
      await fieldFillerQueue.enqueue(async () => {
        const [month, year] = await this.answer()
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
