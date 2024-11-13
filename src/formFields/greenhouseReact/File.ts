import { AnswerValueSingleFileUpload } from "../../components/AnswerValueDisplayComponents/AnswerValueSingleFileUpload";
import { saveButtonClickHandlers } from "../../hooks/saveButtonClickHandlers";
import { sleep } from "../../utils/async";
import fieldFillerQueue from "../../utils/fieldFillerQueue";
import { localStorageToFile } from "../../utils/file";
import { getElement } from "../../utils/getElements";
import { AnswerValueMethods, getReactProps } from "../baseFormInput";
import { GreenhouseReactBaseInput } from "./GreenhouseReactBaseInput";
import * as xpaths from './xpaths'


export class File extends GreenhouseReactBaseInput<any> {
  static XPATH = xpaths.FILE
  fieldType = 'SingleFileUpload'
  public saveButtonClickHandler = saveButtonClickHandlers.withNotice
  fieldNotice = "To save and autofill files, upload them in the 'Answers' section below."
  fieldNoticeLink = {
    display: "See How",
    url: "https://www.youtube.com/watch?v=JYMATq9siIY&t=134s"
  }
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
      if (mutations.some(({ addedNodes, removedNodes }) => {
        return (
          [...addedNodes].some(
            (el: HTMLElement) => {
              return el.getAttribute('class') === 'file-upload__filename'
            }
          ) ||
          [...removedNodes].some(
            (el: HTMLElement) => {
              return el.getAttribute('class') === 'file-upload__filename'
            }
          )
        )
      })) {
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

  
  async fill(): Promise<void> {
    await fieldFillerQueue.enqueue(async () => {
      const answers = await this.answer()
      if (answers.length > 0) {
        if (this.deleteButtonElement) {
          this.deleteButtonElement.click()
          await sleep(500)
        }
        const file = localStorageToFile(answers[0].answer)
        const reactProps = getReactProps(this.inputElement)
        reactProps?.onChange({target: {files: [file]}})
      }
    })
  }
}