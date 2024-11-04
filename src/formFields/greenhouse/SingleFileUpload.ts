import { isEqual } from 'lodash'
import { AnswerValueSingleFileUpload } from '../../components/AnswerValueDisplayComponents/AnswerValueSingleFileUpload'
import { saveButtonClickHandlers } from '../../hooks/saveButtonClickHandlers'
import { getElement } from '../../utils/getElements'
import { AnswerValueMethods } from '../baseFormInput'
import { GreenhouseBaseInput } from './GreenhouseBaseInput'
import * as xpaths from './xpaths'
import { LocalStorageFile, localStorageToFile } from '../../utils/file'
import fieldFillerQueue from '../../utils/fieldFillerQueue'
import { sleep } from '../../utils/async'
import { dispatchFileDragEvent } from '../../utils/fileUploadHelpers'
export class SingleFileUpload extends GreenhouseBaseInput<any> {
  static XPATH = xpaths.SINGLE_FILE_UPLOAD
  fieldType = 'SingleFileUpload'
  public saveButtonClickHandler = saveButtonClickHandlers.withNotice
  fieldNotice =
    "To save and autofill a file, upload it in the 'Answers' section below."
  fieldNoticeLink = {
    display: 'See How',
    url: 'https://www.youtube.com/watch?v=JYMATq9siIY&t=134s',
  }
  get answerValue() {
    return {
      ...super.answerValue,
      displayComponent: AnswerValueSingleFileUpload,
    } as AnswerValueMethods
  }

  listenForChanges(): void {
    const chosenFileDisplayElement = getElement(
      this.element,
      ".//div[@class='chosen']"
    )
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      this.triggerReactUpdate()
    })

    observer.observe(chosenFileDisplayElement, {
      attributes: true,
      attributeFilter: ['style'],
    })
  }

  inputElement(): HTMLInputElement {
    return
  }

  inputDisplayElement(): HTMLElement {
    return getElement(
      this.element,
      ".//div[contains(@class, 'attach-or-paste')]"
    )
  }

  public isFilled(current: any, stored: LocalStorageFile[]): boolean {
    return current === stored[0].name
  }

  get deleteButtonElement(): HTMLElement {
    return getElement(
      this.element,
      ".//button[@aria-label='Remove attachment']"
    )
  }

  get dropZoneElement(): HTMLElement {
    return getElement(this.element, ".//div[contains(@class, 'drop-zone')]")
  }

  currentValue() {
    const XPATH = [
      ".//div[@class='chosen']",
      "//span[contains(@id, '_filename')]",
    ].join('')
    return getElement(this.element, XPATH)?.innerText || ''
  }
  async fill(): Promise<void> {
    await fieldFillerQueue.enqueue(async () => {
      const answer = (await this.answer()) || []
      if (answer.length > 0 && answer[0].answer) {
        const file = localStorageToFile(answer[0].answer)
        this.deleteButtonElement.click()
        dispatchFileDragEvent('drop', this.dropZoneElement, [file])
      }
    })
  }
}
