import { getElement, getElements } from '../../utils/getElements'

const SECTION_XPATH = `.//div[@class = "education"]`
const SECTION_WRAPPER_XPATH = `.//div[@id="education_section"]`



export class Sections {
  static XPATH = SECTION_WRAPPER_XPATH
  element: HTMLElement
  
  static async autoDiscover(node: Node = document) {
    const elements = getElements(node, this.XPATH)
    elements.forEach((el) => {
      if (!el.hasAttribute("job-app-filler")) {
        // @ts-ignore
        const input = new this(el)
      }
    })
  }

  constructor(element: HTMLElement) {
    this.element = element
    this.registerElement()
    this.registerSections()
    this.reregisterSectionsOnMutation()
  }

  registerElement(): void {
    this.element.setAttribute("job-app-filler", "section-wrapper")
  }

  registerSections(): void {
    const sectionElements = getElements(document, SECTION_XPATH)
    sectionElements.forEach((element, index) => {
      element.setAttribute("jaf-section", "education " + (index+1).toString())
    })
  }

  reregisterSectionsOnMutation(): void {
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      if (getElement(mutations, `self::div[@class = "education"]`)) {
        this.registerSections()
      }
    })
    observer.observe(this.element, {childList: true})
  }

}