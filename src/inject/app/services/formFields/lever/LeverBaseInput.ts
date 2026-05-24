import { createRoot } from 'react-dom/client'
import { BaseFormInput, isRegistered, isVisible } from '../baseFormInput'
import { getElement, getElements } from '@src/shared/utils/getElements'

/**
 * Shared base class for every Lever field adapter.
 *
 * Mirrors `GreenhouseBaseInput`:
 *  - filters out invisible / already-registered elements during autodiscovery
 *  - exposes an `inputElement()` accessor that subclasses must implement
 *  - inserts the React widget immediately before the visible input so the
 *    "saved answer" UI sits flush above the form field, matching the layout
 *    other adapters use.
 */
export abstract class LeverBaseInput<
  AnswerType
> extends BaseFormInput<AnswerType> {
  abstract inputElement(): HTMLInputElement

  static async autoDiscover(node: Node = document): Promise<void> {
    const elements = getElements(node, this.XPATH)
    elements.forEach((el) => {
      if (isRegistered(el) || !isVisible(el)) {
        return
      }
      // @ts-ignore
      new this(el)
    })
  }

  /**
   * Element the React widget is rendered immediately before.
   * Subclasses may override (e.g. file upload uses a wrapper div instead
   * of the bare `<input type="file">`).
   */
  inputDisplayElement(): HTMLElement {
    return this.inputElement()
  }

  /**
   * Lever labels live in adjacent `<label>` elements; the default
   * `BaseFormInput.fieldName` already covers this. The override here lets
   * us strip trailing required-marker glyphs ("✱", "*") that Lever appends
   * to mandatory questions so the saved-answer path stays stable.
   */
  public get fieldName(): string {
    const raw = super.fieldName
    if (!raw) {
      return raw
    }
    return raw.replace(/[✱*]\s*$/u, '').trim()
  }

  /**
   * Lever does not currently render repeating sub-forms on the apply
   * page, but we keep the hook so the `path` shape stays consistent with
   * the Greenhouse adapter — the React widget keys answers by section.
   */
  sectionElement(): HTMLElement {
    return getElement(this.element, `ancestor::div[@jaf-section]`)
  }

  get section(): string {
    return this.sectionElement()?.getAttribute('jaf-section') || ''
  }

  attachReactApp(app: React.ReactNode, _inputContainer: HTMLElement): void {
    const rootElement = document.createElement('div')
    rootElement.classList.add('jaf-widget')
    const anchor = this.inputDisplayElement()
    if (anchor?.parentElement) {
      anchor.parentElement.insertBefore(rootElement, anchor)
      createRoot(rootElement).render(app)
    }
  }
}
