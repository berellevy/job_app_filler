import { client } from '../../inject/inject'
import { sleep } from '../../utils/async'
import fieldFillerQueue from '../../utils/fieldFillerQueue'
import { getElement, waitForElement } from '../../utils/getElements'
import { scrollBack } from '../../utils/scroll'
import { getReactProps } from '../baseFormInput'
import { FieldSnapshot } from '../types'
import { WorkdayBaseInput } from './workdayBaseInput'
import * as xpaths from './xpaths'

export class SearchableSingleDropdown extends WorkdayBaseInput<
  string[] | null
> {
  static XPATH = xpaths.SEARCHABLE_SINGLE_DROPDOWN
  fieldType = 'SimpleDropdown'

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
              this.error = null
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
  get selectedItemElement(): HTMLElement {
    const XPATH = [
      ".//ul[@data-automation-id='selectedItemList']",
      '//li',
    ].join('')
    return getElement(this.element, XPATH)
  }

  currentValue(): string[] {
    if (this.selectedItemElement) {
      return [this.selectedItemElement.textContent]
    } else {
      return []
    }
  }

  async isFilled(): Promise<boolean> {
    const answer = (await this.answer()) || []
    return answer.includes(this.currentValue()[0])
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

  async dropdownElement(): Promise<HTMLElement | undefined | null> {
    await sleep(100)
    const dropdownId = this.multiSelectContainerElement.getAttribute('id')
    const XPATH = [
      './/body',
      "/div[@data-automation-widget='wd-popup']",
      `[//div[@data-associated-widget='${dropdownId}']]`,
    ].join('')
    return await waitForElement(document, XPATH)
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

  /**
   * This field can be filled by typing a query into the `inputElement` 
   * and hitting tab or enter. The dropdown doesn't need to be opened.
   * on tab down, a the value of e.target is used to search for
   * and select the correct answer, if available.
   * Filling is as simple as calling the onKeyDown method of the react input el.
   * Doing this opens the dropdown, so it needs to be closed.
   */
  async fill(): Promise<void> {
    if ((await this.hasAnswer()) && !(await this.isFilled())) {
      fieldFillerQueue.enqueue(async () => {
        await scrollBack(async () => {
          const answerList = (await this.answer()) || []
          if (answerList.length > 0) {
            await sleep(500)
            while (answerList.length > 0) {
              const answer = answerList.shift()
              getReactProps(this.inputElement).onKeyDown({
                key: 'Tab',
                target: { value: answer },
              })
              await sleep(100)
              if (await this.isFilled()) {
                this.closeDropdown()
                break
              }
            }
          }
          await sleep(400) // if we don't wait, the react app doesn't reflect changes
          // when the answer replaces an existing value.
          this.triggerReactUpdate()
        })
      })
    }
  }
}
