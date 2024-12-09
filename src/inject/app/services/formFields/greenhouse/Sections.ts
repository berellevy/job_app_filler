import { getElement, getElements } from '@src/shared/utils/getElements'

const SECTION_CLASSES = `[@class="education" or @class="employment"]`
const SECTION_WRAPPER_IDS = `[@id="education_section" or @id="employment_section"]`

export class Sections {
  static XPATH = `.//div${SECTION_WRAPPER_IDS}`
  element: HTMLElement

  static async autoDiscover(node: Node = document) {
    const elements = getElements(node, this.XPATH)
    elements.forEach((el) => {
      if (!el.hasAttribute('job-app-filler')) {
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
    this.element.setAttribute('job-app-filler', 'section-wrapper')
  }

  get sectionType(): string {
    return this.element.id.split('_')[0]
  }

  registerSections(): void {
    const sectionElements = getElements(this.element, `.//div${SECTION_CLASSES}`)
    sectionElements.forEach((element, index) => {
      const sectionId = this.sectionType + ' ' + (index + 1).toString()
      element.setAttribute('jaf-section', sectionId)
    })
  }

  reregisterSectionsOnMutation(): void {
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      if (getElement(mutations, `self::div${SECTION_CLASSES}`)) {
        this.registerSections()
      }
    })
    observer.observe(this.element, { childList: true })
  }
}
