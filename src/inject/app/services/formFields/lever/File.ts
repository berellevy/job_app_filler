import { AnswerValueSingleFileUpload } from '../../../MoreInfoPopup/AnswerDisplay/AnswerValueDisplay/AnswerValueSingleFileUpload'
import { getElement } from '@src/shared/utils/getElements'
import { AnswerValueMethods } from '../baseFormInput'
import { LeverBaseInput } from './LeverBaseInput'
import { xpaths } from './xpaths'
import { LocalStorageFile, localStorageToFile } from '@src/shared/utils/file'
import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import { saveButtonClickHandlers } from '../../../hooks/saveButtonClickHandlers'

/**
 * Lever resume upload — `<input type="file" id="resume-upload-input">`.
 *
 * Unlike the Greenhouse adapter (which dispatches a synthesised
 * `DragEvent` onto a `<div class="drop-zone">`), Lever uses a plain
 * `<input type="file">`. The reliable cross-browser path for a real
 * file input is to attach a `DataTransfer`-built `FileList` directly
 * to `input.files`, then dispatch `input` + `change`. This is how
 * Puppeteer's `uploadFile` ultimately gets re-played by Lever's own
 * progress handler (driven by the `.resume-upload-success` /
 * `.resume-upload-failure` elements observed below).
 */
export class File extends LeverBaseInput<LocalStorageFile> {
  static XPATH: string = xpaths.FILE_UPLOAD
  fieldType = 'SingleFileUpload'
  public saveButtonClickHandler = saveButtonClickHandlers.withNotice
  fieldNotice =
    "To save and autofill a file, upload it in the 'Answers' section below."
  fieldNoticeLink = {
    display: 'See How',
    url: 'https://www.youtube.com/watch?v=JYMATq9siIY&t=134s',
  }

  get answerValue(): AnswerValueMethods {
    return {
      ...super.answerValue,
      displayComponent: AnswerValueSingleFileUpload,
    } as AnswerValueMethods
  }

  inputElement(): HTMLInputElement {
    return getElement(
      this.element,
      `.//input[@type="file"][@id="resume-upload-input"]`
    ) as HTMLInputElement
  }

  /**
   * Lever renders the file input inside a visually-hidden wrapper and
   * shows a styled label/button alongside. Anchor the React widget to
   * the wrapper so it stays visible.
   */
  inputDisplayElement(): HTMLElement {
    return (
      getElement(this.element, `.//div[contains(@class, "resume-upload")]`) ||
      this.inputElement()
    )
  }

  /**
   * The filename Lever surfaces after a successful upload lives in
   * `div.resume-upload-success > span.parsed-name` (when parsing
   * succeeds) or falls back to the input's own `files[0].name`.
   */
  currentValue(): string {
    const parsed = getElement(
      this.element,
      `.//div[contains(@class, "resume-upload-success")]//*[contains(@class, "parsed-name")]`
    )
    if (parsed?.innerText) {
      return parsed.innerText
    }
    const file = this.inputElement()?.files?.[0]
    return file?.name || ''
  }

  public isFilled(current: string, stored: LocalStorageFile[]): boolean {
    if (!stored || stored.length === 0) {
      return false
    }
    return current === stored[0].name
  }

  listenForChanges(): void {
    const observer = new MutationObserver(() => {
      this.triggerReactUpdate()
    })
    observer.observe(this.element, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    })
  }

  async fill(): Promise<void> {
    await fieldFillerQueue.enqueue(async () => {
      const answers = await this.answer()
      if (answers.length === 0 || !answers[0].answer) {
        return
      }
      const input = this.inputElement()
      if (!input) {
        return
      }
      const file = localStorageToFile(answers[0].answer)
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      input.files = dataTransfer.files
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
    })
  }
}
