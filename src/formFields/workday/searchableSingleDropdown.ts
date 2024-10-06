import { AnswerValueBackupStrings } from '../../components/AnswerValueDisplayComponents/AnswerValueBackupStrings'
import { answerValueInitList } from '../../hooks/answerValueInit'
import { saveButtonClickHandlers } from '../../hooks/saveButtonClickHandlers'
import {
  EditableAnswer,
  useEditableAnswerState,
} from '../../hooks/useEditableAnswerState'

import { sleep } from '../../utils/async'
import fieldFillerQueue from '../../utils/fieldFillerQueue'
import { getElement, waitForElement } from '../../utils/getElements'
import { scrollBack } from '../../utils/scroll'
import { Answer } from '../../utils/types'
import { AnswerValueMethods, getReactProps } from '../baseFormInput'
import { WorkdayBaseInput } from './workdayBaseInput'
import * as xpaths from './xpaths'
import * as stringMatch from '../../utils/stringMatch'

export class SearchableSingleDropdown extends WorkdayBaseInput<
  string[] | null
> {
  editableAnswerHook = useEditableAnswerState
  static XPATH = xpaths.SEARCHABLE_SINGLE_DROPDOWN
  fieldType = 'SimpleDropdown'
  // public saveButtonClickHandler = saveButtonClickHandlers.backupAnswerList
  public get answerValue() {
    return {
      ...super.answerValue,
      displayComponent: AnswerValueBackupStrings,
      init: answerValueInitList,
      prepForSave: (values: [string, boolean][]) =>
        values.map(([value, editable]) => value),
      prepForFill: (answers: EditableAnswer[]): string[] => {
        return super.answerValue.prepForFill(answers).flat()
      },
    } as AnswerValueMethods
  }

  /**
   * A cached property is only necessary if `listenForChanges`
   * will be called more than once. But leave it for now.
   */
  private _observer: MutationObserver | null
  get observer(): MutationObserver {
    if (!this._observer) {
      this._observer = new MutationObserver((mutations) => {
        mutations.forEach(({ addedNodes, removedNodes }) => {
          ;[...addedNodes, ...removedNodes].forEach((node) => {
            if (
              getElement(node, ".//ul[@data-automation-id='selectedItemList']")
            ) {
              this.triggerReactUpdate()
            }
          })
        })
      })
    }
    return this._observer
  }


  /**
   * A change is when an answer element is added or removed.
   */
  listenForChanges(): void {
    this.observer.observe(this.multiSelectContainerElement, {
      childList: true,
      subtree: true,
    })
  }

  // CURRENT VALUE AND IS FILLED
  get selectedItemElementXpath(): string {
    return [".//ul[@data-automation-id='selectedItemList']", '//li'].join('')
  }
  get selectedItemElement(): HTMLElement {
    const XPATH = this.selectedItemElementXpath
    return getElement(this.element, XPATH)
  }

  currentValue(): string {
    if (this.selectedItemElement) {
      return this.selectedItemElement.textContent
    }
  }

  public get fieldSnapshot(): Answer {
    return {
      path: this.path,
      answer: [this.currentValue()],
    }
  }

  // CLOSE DROPDOWN AFTER FILL.
  /**
   * This element's id is used to identify the dropdown element,
   * since the dropdown is a popup and not a direct child of this
   * field.
   */
  get multiSelectContainerElement(): HTMLElement {
    return getElement(
      this.element,
      ".//div[@data-automation-id='multiSelectContainer']"
    )
  }

  get dropdownId(): string {
    return this.multiSelectContainerElement.getAttribute('id')
  }

  get dropdownElementXpath(): string {
    return [
      './/body',
      "/div[@data-automation-widget='wd-popup']",
      `[//div[@data-associated-widget='${this.dropdownId}']]`,
    ].join('')
  }

  async dropdownElement(): Promise<HTMLElement | undefined | null> {
    await sleep(100)
    return await waitForElement(document, this.dropdownElementXpath, { timeout: 1000 })
  }


  public clickIsInFormfield(e: PointerEvent): boolean {
    const target = e.target as HTMLElement
    return (
      super.clickIsInFormfield(e) ||
      Boolean(target.closest(`[data-associated-widget='${this.dropdownId}']`))
    )
  }

  /**
   * I couldn't find the function that would close it reliably,
   * so just remove the whole dropdown element. Ugly, but better
   * than nothing.
   */
  private async closeDropdown() {
    const dropdownElement = await this.dropdownElement()
    if (dropdownElement) {
      dropdownElement.remove()
    }
  }

  // FILL
  get inputElement(): HTMLElement {
    return getElement(this.element, './/input')
  }

  isFilled(current: string, stored: string[]) {
    return stored.some((answer) => {
      return (
        answer === current
        // stringMatch.contains(current, answer) ||
        // stringMatch.keywordCount(current, answer)
      )
    })
  }

  /**
   * FILL PROCESS
   * This field can be filled by typing a query into the `inputElement`
   * and hitting tab or enter. The dropdown doesn't need to be opened.
   * on tab down, a the value of e.target is used to search for
   * and select the correct answer, if available.
   * Therefore, filling is as simple as calling the onKeyDown method of the react input el.
   *
   * FILL CONFIRMATION
   * after filling, we wait for the appearance an asnswer element that contains
   * the correct answer
   *
   * Doing this may open the dropdown, so it needs to be closed.
   * if awaiting for the the fill method, the dropdown is closed asynchronously
   */
  async fill(): Promise<void> {
    await fieldFillerQueue.enqueue(async () => {
      await scrollBack(async () => {
        const answers = await this.answer()
        const answerValues = answers
          .map((answer: Answer) => answer.answer)
          .flat()
        if (answerValues.length > 0) {
          const answerList = structuredClone(answerValues)
          await sleep(500)
          while (answerList.length > 0) {
            const answer = answerList.shift()
            // search for answer
            getReactProps(this.inputElement).onKeyDown({
              key: 'Tab',
              target: { value: answer },
            })
            // break if the selected item matches our answer
            const el = await waitForElement(
              this.element,
              this.selectedItemElementXpath,
              { timeout: 500 }
            )
            if (el && this.isFilled(el.innerText, answerValues)) {
              break
            }
            // if there are multiple matches, click the first one.
            const dropdownElement = await this.dropdownElement()
            dropdownElement && getElement(dropdownElement, ".//div[@data-automation-id='promptOption']")?.click()
          }
          this.closeDropdown() // asynchronously
        }
      })
    })
  }
}
