import { getElement, getElements } from '@src/shared/utils/getElements'

const SECTION_XPATH = `.//div[@class = "education--form"]`

const assignNumbersToSections = () => {
  const sectionElements = getElements(document, SECTION_XPATH)
  sectionElements.forEach((element, index) => {
    element.setAttribute("jaf-section", "education " +(index+1).toString())
  })
}


/**
 * not a formfield
 * registers repeating sections and gives them a number
 */
export class Section {
  static XPATH = SECTION_XPATH
  element: Node

  static async autoDiscover(node: Node = document) {
    const elements = getElements(node, this.XPATH)
    elements.forEach((el) => {
      if (!el.hasAttribute('jaf-section')) {
        // @ts-ignore
        const input = new this(el)
      }
    })
  }

  constructor (element: HTMLElement) {
    this.element = element
    assignNumbersToSections()
    this.reassignNumberOnRemoval()
  }

  reassignNumberOnRemoval(): void {
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      if (getElement(
        mutations,
        `self::div[@class = "education--form"]`,
        {only: "removedNodes"}
      )) {
        assignNumbersToSections()
        observer.disconnect()
      }
    })
    observer.observe(this.element.parentElement, {childList: true})
  }

}
