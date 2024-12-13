import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import {
  getElement,
  getElements,
  waitForElement,
} from '@src/shared/utils/getElements'
import { GreenhouseBaseInput } from './GreenhouseBaseInput'
import { xpaths } from './xpaths'
import AnswerDTO from '../../DTOs/AnswerDTO'

export class DropdownSearchable extends GreenhouseBaseInput {
  static XPATH = xpaths.DROPDOWN_SEARCHABLE
  fieldType = 'Dropdown'

  inputElement(): HTMLInputElement {
    return getElement(this.element, './/select') as HTMLInputElement
  }

  get select2ContainerElement(): HTMLElement {
    return getElement(
      this.element,
      ".//div[contains(@class, 'select2-container')]"
    )
  }

  get select2ContainerAElement(): HTMLElement {
    return getElement(this.select2ContainerElement, './/a')
  }

  toggleDropdown(): void {
    this.select2ContainerAElement?.dispatchEvent(new MouseEvent('mousedown'))
  }
  openDropdown(): void {
    if (!this.dropdownIsOpen) {
      this.toggleDropdown()
    }
  }

  closeDropdown(): void {
    if (this.dropdownIsOpen) {
      this.toggleDropdown()
    }
  }

  get dropdownIsOpen(): boolean {
    return this.select2ContainerElement.classList.contains(
      'select2-dropdown-open'
    )
  }

  get dropdownId(): string {
    return getElement(this.select2ContainerElement, './label')?.getAttribute(
      'for'
    )
  }

  get dropdownElement(): DropdownElement {
    const XPATH = [
      ".//div[contains(@class, 'select2-drop-active')]",
      `[.//label[@for='${this.dropdownId}_search']]`,
    ].join('')
    const dropdown = getElement(document, XPATH)
    return new DropdownElement(dropdown)
  }

  inputDisplayElement(): HTMLElement {
    return this.select2ContainerElement
  }

  listenForChanges(): void {
    const observer = new MutationObserver((mutationsList) => {
      this.triggerReactUpdate()
    })

    observer.observe(this.select2ContainerElement, {
      childList: true,
      subtree: true,
    })
  }

  currentValue() {
    return this.select2ContainerAElement?.innerText
  }

  async fill(answers: AnswerDTO[]): Promise<void> {
    await fieldFillerQueue.enqueue(async () => {
      for (const answer of answers) {
        const answerValue = answer.answer
        this.openDropdown()
        if (await this.dropdownElement.selectCorrectAnswer(answerValue as string)) {
          break
        }
      }
      this.closeDropdown()
    })
  }
}

class DropdownElement {
  element: HTMLElement
  constructor(element: HTMLElement) {
    this.element = element
  }

  getElement(xpath: string): HTMLElement {
    return getElement(this.element, xpath)
  }

  get searchInput(): HTMLInputElement {
    return this.getElement(
      `.//div[@class="select2-search"]/input`
    ) as HTMLInputElement
  }

  /**
   * perform a search and return the resultslist.
   * Note: whenever you perform a search, an `li` with
   * innerText "Searching..." (very) briefly appears
   * before results appear.
   */
  performSearch(value: string): Promise<HTMLElement> {
    const RESULTS_ELEMENT_XPATH = [
      `.//ul`,
      `[not(./li[starts-with(text(),"Searching")])]`,
    ].join('')
    return new Promise((resolve) => {
      waitForElement(this.element, RESULTS_ELEMENT_XPATH, {
        onlyNew: true,
        timeout: 600,
      }).then((foundElement) => resolve(foundElement))
      this.searchInput.value = value
      this.searchInput.dispatchEvent(new InputEvent('input'))
    })
  }

  /**
   * Returns the li element whose innerText matches `value`
   */
  async search(value: string): Promise<HTMLElement> {
    const searchResults = await this.performSearch(value)
    const listElements = getElements(searchResults, `./li`)
    return listElements.find((el) => el.innerText === value)
  }
  /**
   * returns `true` if the correct answer is found and selected
   */
  async selectCorrectAnswer(answerValue: string): Promise<boolean> {
    const correctAnswerElement = await this.search(answerValue)
    const mouseupEvent = new Event('mouseup', {
      bubbles: true,
      cancelable: true,
    })
    return !!(
      correctAnswerElement && correctAnswerElement.dispatchEvent(mouseupEvent)
    )
  }
}
