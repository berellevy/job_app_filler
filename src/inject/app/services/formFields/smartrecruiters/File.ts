import { AnswerValueSingleFileUpload } from "../../../MoreInfoPopup/AnswerDisplay/AnswerValueDisplay/AnswerValueSingleFileUpload"
import { sleep } from "@src/shared/utils/async"
import fieldFillerQueue from "@src/shared/utils/fieldFillerQueue"
import {
  LocalStorageFile,
  localStorageToFile,
} from "@src/shared/utils/file"
import { getElement } from "@src/shared/utils/getElements"
import { AnswerValueMethods } from "../baseFormInput"
import { dispatchFileDragEvent } from "@src/shared/utils/fileUploadHelpers"
import { SmartRecruitersBaseInput } from "./SmartRecruitersBaseInput"
import { xpaths } from "./xpaths"
import { saveButtonClickHandlers } from "../../../hooks/saveButtonClickHandlers"
import { getReactProps } from "../utils"
import { getHsCv } from "@src/shared/utils/hs/cvProvider"

/**
 * Resume / generic file upload.
 *
 * SR ships both a hidden `<input type="file">` (driven directly by the
 * React `onChange`) AND a visible drop-zone div. We attempt the React
 * path first because it preserves any client-side validation hooks; if
 * the input doesn't expose React props (e.g. server-rendered legacy
 * markup) we fall back to a synthesised drag-and-drop event on the
 * drop zone — the same fallback pattern the Greenhouse adapter uses.
 */
export class File extends SmartRecruitersBaseInput<LocalStorageFile> {
  static XPATH = xpaths.FILE
  fieldType = "SingleFileUpload"
  public saveButtonClickHandler = saveButtonClickHandlers.withNotice
  fieldNotice =
    "To save and autofill a file, upload it in the 'Answers' section below."
  fieldNoticeLink = {
    display: "See How",
    url: "https://www.youtube.com/watch?v=JYMATq9siIY&t=134s",
  }

  get answerValue(): AnswerValueMethods {
    return {
      ...super.answerValue,
      displayComponent: AnswerValueSingleFileUpload,
    } as AnswerValueMethods
  }

  get inputElement(): HTMLInputElement | null {
    return getElement(
      this.element,
      `.//input[@type="file"]`
    ) as HTMLInputElement | null
  }

  get dropZoneElement(): HTMLElement | null {
    return getElement(
      this.element,
      `.//div[contains(@class, "drop-zone") or contains(@class, "file-upload")]`
    )
  }

  get deleteButtonElement(): HTMLElement | null {
    return getElement(
      this.element,
      `.//button[@aria-label="Remove file" or @aria-label="Remove attachment"]`
    )
  }

  get filenameDisplayElement(): HTMLElement | null {
    return getElement(
      this.element,
      `.//*[contains(@class, "filename") or contains(@class, "file-name")]`
    )
  }

  listenForChanges(): void {
    const observer = new MutationObserver(() => {
      this.triggerReactUpdate()
    })
    observer.observe(this.element, {
      attributes: true,
      childList: true,
      subtree: true,
    })
  }

  currentValue(): string {
    return this.filenameDisplayElement?.innerText ?? ""
  }

  public isFilled(current: string, stored: LocalStorageFile[]): boolean {
    return !!stored[0] && current === stored[0].name
  }

  async fill(): Promise<void> {
    await fieldFillerQueue.enqueue(async () => {
      const answers = await this.answer()
      const stored = answers[0]?.answer as LocalStorageFile | undefined
      const hsCv = getHsCv()
      const file = hsCv ?? (stored ? localStorageToFile(stored) : null)
      if (!file) {
        return
      }
      if (this.deleteButtonElement) {
        this.deleteButtonElement.click()
        await sleep(500)
      }
      const input = this.inputElement
      const reactProps = input ? getReactProps(input) : null
      if (reactProps?.onChange) {
        reactProps.onChange({ target: { files: [file] } })
        return
      }
      const dropZone = this.dropZoneElement
      if (dropZone) {
        dispatchFileDragEvent("drop", dropZone, [file])
      }
    })
  }
}
