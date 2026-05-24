import { createRoot } from 'react-dom/client'
import { BaseFormInput, isRegistered, isVisible } from '../baseFormInput'
import { getElement, getElements } from '@src/shared/utils/getElements'

/**
 * Shared base class for every iCIMS field adapter.
 *
 * Mirrors `LeverBaseInput` / `GreenhouseBaseInput`:
 *  - filters out invisible / already-registered elements during autodiscovery
 *  - exposes an `inputElement()` accessor that subclasses must implement
 *  - inserts the React widget immediately before the visible input so the
 *    "saved answer" UI sits flush above the form field, matching the layout
 *    the other adapters use.
 *
 * iCIMS-specific deviations from Lever:
 *  - Classic iCIMS renders fields in table rows with the visible label in a
 *    sibling `<td class="iCIMS_Label"><label>…</label></td>`. The default
 *    `BaseFormInput.labelElement` (first non-blank `<label>`/`<legend>` under
 *    the container) already finds it because we anchor the container at the
 *    enclosing `<tr>`. `fieldName` strips the trailing required marker
 *    ("*" / "✱") iCIMS appends to mandatory questions, matching the
 *    SmartApplyAI label-cleanup behaviour.
 */
export abstract class IcimsBaseInput<
  AnswerType
> extends BaseFormInput<AnswerType> {
  abstract inputElement(): HTMLInputElement

  static async autoDiscover(node: Node = document): Promise<void> {
    const elements = getElements(node, this.XPATH)
    elements.forEach((el) => {
      if (isRegistered(el) || !isVisible(el)) {
        return
      }
      // @ts-ignore — subclasses are concrete; `this` is the constructor.
      new this(el)
    })
  }

  /**
   * Element the React widget is rendered immediately before. Subclasses may
   * override (e.g. the file upload anchors to the `iCIMS_AttachButton`
   * wrapper instead of the bare `<input type="file">`).
   */
  inputDisplayElement(): HTMLElement {
    return this.inputElement()
  }

  /**
   * Strip the trailing required-marker glyphs ("*", "✱") iCIMS appends to
   * mandatory questions so the saved-answer key stays stable.
   */
  public get fieldName(): string {
    const raw = super.fieldName
    if (!raw) {
      return raw
    }
    return raw.replace(/[✱*]\s*$/u, '').trim()
  }

  /**
   * iCIMS apply pages are multi-step, but each step is a flat form rather
   * than a repeating sub-form, so there is no per-section keying today. The
   * hook is kept so the `path` shape stays consistent with the Greenhouse /
   * Lever adapters.
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
