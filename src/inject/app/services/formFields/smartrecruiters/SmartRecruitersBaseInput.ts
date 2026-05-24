import { createRoot } from "react-dom/client"
import { BaseFormInput, isRegistered, isVisible } from "../baseFormInput"
import { getElement, getElements } from "@src/shared/utils/getElements"

/**
 * Base class for every SmartRecruiters form-field adapter.
 *
 * SmartRecruiters renders the apply form with semantic <label> +
 * <input> pairs wrapped in a form-group div, so:
 *   - `labelElement` picks the first non-blank <label>
 *   - the widget is attached immediately after the label
 *   - section grouping is delegated to ancestor `[jaf-section]` divs
 *     so repeating sections (e.g. work history) work the same way as
 *     in the Greenhouse adapters.
 */
export abstract class SmartRecruitersBaseInput<
  AnswerType
> extends BaseFormInput<AnswerType> {
  abstract get inputElement(): HTMLInputElement | HTMLSelectElement | null

  static async autoDiscover(node: Node = document): Promise<void> {
    const elements = getElements(node, this.XPATH)
    elements.forEach((el) => {
      if (isRegistered(el) || !isVisible(el)) {
        return
      }
      // @ts-ignore - constructor is abstract on the base class
      new this(el)
    })
  }

  get labelElement(): HTMLElement {
    const XPATH = [
      `.//label`,
      `[.//text()[normalize-space() != ""]]`,
    ].join("")
    return getElement(this.element, XPATH)
  }

  get labelDisplayElement(): HTMLElement {
    return this.labelElement
  }

  sectionElement(): HTMLElement {
    return getElement(this.element, `ancestor::div[@jaf-section][1]`)
  }

  get section(): string {
    return this.sectionElement()?.getAttribute("jaf-section") || ""
  }

  /** Attach widget immediately after the label. */
  attachReactApp(app: React.ReactNode, _inputContainer: HTMLElement): void {
    const rootElement = document.createElement("div")
    rootElement.classList.add("jaf-widget")
    const anchor = this.labelDisplayElement
    if (!anchor || !anchor.parentElement) {
      return
    }
    anchor.insertAdjacentElement("afterend", rootElement)
    createRoot(rootElement).render(app)
  }
}
