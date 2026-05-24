import { AnswerValueSingleFileUpload } from '../../../MoreInfoPopup/AnswerDisplay/AnswerValueDisplay/AnswerValueSingleFileUpload'
import { getElement } from '@src/shared/utils/getElements'
import { AnswerValueMethods } from '../baseFormInput'
import { IcimsBaseInput } from './IcimsBaseInput'
import { xpaths } from './xpaths'
import { LocalStorageFile, localStorageToFile } from '@src/shared/utils/file'
import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import { saveButtonClickHandlers } from '../../../hooks/saveButtonClickHandlers'

/**
 * iCIMS resume / CV upload — a real `<input type="file">`.
 *
 * On the Talent-Cloud layout the input is wrapped by
 * `div.iCIMS_AttachButton`; classic iCIMS exposes a bare resume file input.
 * Both are real `<input type="file">` controls (not a synthetic dropzone like
 * Greenhouse), so the reliable cross-browser path is to attach a
 * `DataTransfer`-built `FileList` directly to `input.files`, then dispatch
 * `input` + `change`. iCIMS's own attach handler then parses the resume.
 *
 * Sources: aarjunm04/AI_Job_Automation_Agent ats_detector.py
 * (`resume_upload_selector = "input[type=file], div.iCIMS_AttachButton input"`);
 * chandrarup/SmartApplyAI extension/content.js `fillResumeUpload` — finds the
 * resume `input[type=file]`, builds a `DataTransfer`, sets `input.files`, and
 * dispatches a bubbling `change` event.
 */
export class File extends IcimsBaseInput<LocalStorageFile> {
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
      `.//input[@type='file']`
    ) as HTMLInputElement
  }

  /**
   * iCIMS Talent Cloud styles the file input behind an
   * `<div class="iCIMS_AttachButton">` button. Anchor the React widget to that
   * wrapper when present so the saved-answer UI stays visible; otherwise fall
   * back to the input itself.
   */
  inputDisplayElement(): HTMLElement {
    return (
      getElement(
        this.element,
        `.//div[contains(@class, 'iCIMS_AttachButton')]`
      ) || this.inputElement()
    )
  }

  /**
   * iCIMS surfaces the uploaded filename in an attachment list once parsing
   * completes; the dependable cross-generation read is the input's own
   * `files[0].name`, with a best-effort link/label fallback.
   */
  currentValue(): string {
    const file = this.inputElement()?.files?.[0]
    if (file?.name) {
      return file.name
    }
    const attached = getElement(
      this.element,
      [
        ".//*[contains(@class, 'iCIMS_Attachment')]",
        '//a | .//*[contains(@class, "fileName")]',
      ].join('')
    )
    return attached?.innerText || ''
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
