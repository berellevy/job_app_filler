import { AnswerValueSingleFileUpload } from '../../../MoreInfoPopup/AnswerDisplay/AnswerValueDisplay/AnswerValueSingleFileUpload'
import { sleep } from '@src/shared/utils/async'
import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import { LocalStorageFile, localStorageToFile } from '@src/shared/utils/file'
import { getElement } from '@src/shared/utils/getElements'
import { saveButtonClickHandlers } from '../../../hooks/saveButtonClickHandlers'
import { AnswerValueMethods } from '../baseFormInput'
import { AshbyBaseInput } from './AshbyBaseInput'
import { xpaths } from './xpaths'
import { setNativeFiles } from './utils'
import { getHsCv } from '@src/shared/utils/hs/cvProvider'

/**
 * Ashby resume / cover-letter / generic file upload.
 *
 * The visible drop zone is styled, but underneath there is always a
 * real `<input type="file">` that React listens on. We populate it
 * via the native `files` setter and dispatch `change`.
 */
export class File extends AshbyBaseInput<LocalStorageFile> {
  static XPATH: string = xpaths.FILE
  fieldType: string = 'SingleFileUpload'
  public saveButtonClickHandler = saveButtonClickHandlers.withNotice
  fieldNotice: string =
    "To save and autofill files, upload them in the 'Answers' section below."
  fieldNoticeLink = {
    display: 'See How',
    url: 'https://www.youtube.com/watch?v=JYMATq9siIY&t=134s',
  }

  get answerValue(): AnswerValueMethods {
    return {
      ...super.answerValue,
      displayComponent: AnswerValueSingleFileUpload,
    }
  }

  get labelElement(): HTMLElement {
    return getElement(this.element, `.//label`)
  }

  get inputElement(): HTMLInputElement {
    return getElement(
      this.element,
      `.//input[@type="file"]`
    ) as HTMLInputElement
  }

  /**
   * The "filename" displayed after upload. Ashby has no stable class,
   * so we look for any element whose name attribute or visible text
   * reflects the uploaded file. As a robust fallback we read it off
   * the file input itself.
   */
  currentValue(): string {
    const input = this.inputElement
    const firstFile = input?.files?.[0]
    if (firstFile) {
      return firstFile.name
    }
    return ''
  }

  /** Ashby usually exposes a small "remove" / "x" button next to the
   * filename once a file is selected. */
  get deleteButtonElement(): HTMLElement | null {
    return getElement(
      this.element,
      `.//button[contains(translate(@aria-label, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "remove")` +
        ` or contains(translate(., "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "remove")]`
    )
  }

  listenForChanges(): void {
    const input = this.inputElement
    if (!input) {
      return
    }
    input.addEventListener('change', () => this.triggerReactUpdate())

    // Some Ashby layouts swap the drop-zone DOM around when a file is
    // attached/cleared, so also observe the wrapper for re-renders.
    const observer = new MutationObserver(() => this.triggerReactUpdate())
    observer.observe(this.element, {
      childList: true,
      subtree: true,
    })
  }

  public isFilled(current: string, stored: LocalStorageFile[]): boolean {
    if (!stored || stored.length === 0) {
      return false
    }
    return current === stored[0].name
  }

  async fill(): Promise<void> {
    await fieldFillerQueue.enqueue(async () => {
      const answers = await this.answer()
      const hsCv = getHsCv()
      const file = hsCv ?? (answers[0]?.answer ? localStorageToFile(answers[0].answer) : null)
      if (!file) {
        return
      }
      const deleteButton = this.deleteButtonElement
      if (deleteButton) {
        deleteButton.click()
        await sleep(500)
      }
      const input = this.inputElement
      if (input) {
        setNativeFiles(input, [file])
      }
    })
  }
}
