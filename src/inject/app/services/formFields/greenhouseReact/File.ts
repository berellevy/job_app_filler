import { AnswerValueSingleFileUpload } from "../../../MoreInfoPopup/AnswerDisplay/AnswerValueDisplay/AnswerValueSingleFileUpload";
import { sleep } from "@src/shared/utils/async";
import fieldFillerQueue from "@src/shared/utils/fieldFillerQueue";
import { LocalStorageFile, localStorageToFile } from "@src/shared/utils/file";
import { getElement } from "@src/shared/utils/getElements";
import { AnswerValueMethods, } from "../baseFormInput";
import { getReactProps } from "../utils";
import { GreenhouseReactBaseInput } from "./GreenhouseReactBaseInput";
import { xpaths } from "./xpaths";
import { saveButtonClickHandlers } from "../../../hooks/saveButtonClickHandlers";
import AnswerDTO from "../../DTOs/AnswerDTO";


export class File extends GreenhouseReactBaseInput {
  static XPATH = xpaths.FILE
  fieldType = 'SingleFileUpload'
  public saveButtonClickHandler = saveButtonClickHandlers.withNotice
  fieldNotice =
    `##### To save and autofill files, upload them in the 'Answers' section below.
    \n\n[See how](https://www.youtube.com/watch?v=JYMATq9siIY&t=134s)`

  get answerValue() {
    return {
      ...super.answerValue,
      displayComponent: AnswerValueSingleFileUpload,
    } as AnswerValueMethods
  }

  get labelElement(): HTMLElement {
    return getElement(this.element,
      `.//div[contains(@class, "label")]`
    )
  }

  listenForChanges(): void {
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      const XPATH = `self::*[starts-with(@class, "file-upload__filename")]`
      if (getElement(mutations, XPATH)) {
        this.triggerReactUpdate()
      }
    })
    observer.observe(this.element, {
      childList: true,
      subtree: true,
    })
  }

  currentValue() {
    return getElement(
      this.element,
      `.//div[@class="file-upload__filename"]`
    )?.innerText || ""

  }

  get deleteButtonElement(): HTMLElement {
    return getElement(
      this.element,
      ".//button[@aria-label='Remove file']"
    )
  }

  get inputElement(): HTMLInputElement {
    return getElement(
      this.element,
      `.//input[@type="file"]`
    ) as HTMLInputElement
  }

  public isFilled(current: any, stored: any[]): boolean {
    return current === stored[0].name
  }

  async deleteCurrentFile(): Promise<void> {
    if (this.deleteButtonElement) {
      this.deleteButtonElement.click()
      await sleep(500)
    }
  }

  async fill(answers: AnswerDTO<LocalStorageFile>[]): Promise<void> {
    await fieldFillerQueue.enqueue(async () => {
      await this.deleteCurrentFile()
      const file = localStorageToFile(answers[0].answer)
      const reactProps = getReactProps(this.inputElement)
      reactProps?.onChange({ target: { files: [file] } })
    })
  }
}