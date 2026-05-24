import { createRoot } from 'react-dom/client'
import { BaseFormInput, isRegistered, isVisible } from '../baseFormInput'
import { getElement, getElements } from '@src/shared/utils/getElements'

/**
 * Shared base class for every Ashby field type.
 *
 * Mirrors `GreenhouseReactBaseInput`: each field is identified by a
 * wrapper element containing a label + control, and the React widget
 * (the "filler" UI) is mounted immediately after the label.
 */
export abstract class AshbyBaseInput<AnswerType> extends BaseFormInput<
  AnswerType
> {
  /**
   * Filter out invisible / already-registered wrappers during
   * autodiscovery. Ashby renders hidden inputs (e.g. the file input behind
   * a styled drop zone, conditional questions that are display:none until
   * revealed) so — unlike the default `BaseFormInput.autoDiscover` — we
   * skip zero-height elements to avoid registering ghost fields.
   */
  static async autoDiscover(node: Node = document): Promise<void> {
    const elements = getElements(node, this.XPATH)
    elements.forEach((el) => {
      if (isRegistered(el) || !isVisible(el)) {
        return
      }
      // @ts-ignore — `this` is the concrete subclass constructor.
      new this(el)
    })
  }

  /** Override in subclasses that have a separate visual label container. */
  get labelDisplayElement(): HTMLElement {
    return this.labelElement
  }

  abstract get labelElement(): HTMLElement

  /**
   * Ashby appends a required-marker glyph ("*" / "✱") to mandatory
   * question labels. Strip it so the saved-answer key stays stable across
   * postings where the same question may or may not be required.
   */
  public get fieldName(): string {
    const raw = super.fieldName
    if (!raw) {
      return raw
    }
    return raw.replace(/[✱*]\s*$/u, '').trim()
  }

  /**
   * Ashby application forms don't currently use repeating sections in
   * the way Greenhouse does (e.g. multiple education entries), so the
   * section is always empty. Subclasses may override if needed.
   */
  get section(): string {
    return ''
  }

  attachReactApp(app: React.ReactNode, _inputContainer: HTMLElement): void {
    const rootElement = document.createElement('div')
    rootElement.classList.add('jaf-widget')
    this.labelDisplayElement?.insertAdjacentElement('afterend', rootElement)
    createRoot(rootElement).render(app)
  }

  /**
   * Convenience: find the first descendant matching the relative xpath.
   * Subclasses pass relative xpaths; we resolve them against `this.element`.
   */
  protected find<T extends HTMLElement = HTMLElement>(xpath: string): T {
    return getElement(this.element, xpath) as T
  }
}
