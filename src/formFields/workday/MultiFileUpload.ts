import { sleep } from '../../utils/async'
import fieldFillerQueue from '../../utils/fieldFillerQueue'
import {
  getElement,
  getElements,
  waitForElement,
} from '../../utils/getElements'
import { Answer } from '../../utils/types'
import { AnswerValueMethods, getReactProps } from '../baseFormInput'
import { WorkdayBaseInput } from './workdayBaseInput'
import * as xpaths from './xpaths'
import { AnswerValueMultiFileUpload } from '../../components/AnswerValueDisplayComponents/AnswerValueMultiFileUpload'
import { LocalStorageFile, localStorageToFile } from '../../utils/file'
import { isEqual } from 'lodash'

export class MultiFileUpload extends WorkdayBaseInput<any> {
  fieldType = 'MultiFileUpload'
  static XPATH = xpaths.MULTI_FILE_UPLOAD
  get answerValue() {
    return {
      ...super.answerValue,
      displayComponent: AnswerValueMultiFileUpload,
    } as AnswerValueMethods
  }
  listenForChanges(): void {
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      if (mutations.some(({ addedNodes, removedNodes }) => {
        return (
          [...addedNodes].some(
            (el: HTMLElement) =>
              el.getAttribute('data-automation-id') === 'file-upload-successful'
          ) ||
          [...removedNodes].some(
            (el: HTMLElement) =>
              el.getAttribute('data-automation-id') === 'file-upload-item'
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

  get dropZoneElement(): HTMLElement {
    return getElement(
      this.element,
      ".//div[@data-automation-id='file-upload-drop-zone']"
    )
  }

  get uploadedFileElements(): HTMLElement[] {
    return getElements(
      this.element,
      ".//div[@data-automation-id='file-upload-item']"
    )
  }

  get uploadedFileDeleteButtonElements(): HTMLElement[] {
    return getElements(
      this.element,
      ".//button[@data-automation-id='delete-file']"
    )
  }

  getUploadedFileName(uploadedFileElement: HTMLElement): string {
    return getElement(
      uploadedFileElement,
      ".//div[@data-automation-id='file-upload-item-name']"
    )?.innerText
  }

  get fieldName() {
    return this.dropZoneElement.parentElement.parentElement.getAttribute(
      'data-automation-id'
    )
  }

  currentValue() {
    return this.uploadedFileElements.map(this.getUploadedFileName)
  }

  public isFilled(current: any[], stored: any[]): boolean {
    const firstAnswerFileNames = stored[0].map(
      (file: LocalStorageFile) => file.name
    )
    return isEqual(current, firstAnswerFileNames)
  }

  async fill(): Promise<void> {
    const answer = (await this.answer()) || []
    if (answer.length > 0) {
      await fieldFillerQueue.enqueue(async () => {
        const firstAnswer = answer[0]
        const files = firstAnswer.answer.map(localStorageToFile)
        for (const button of this.uploadedFileDeleteButtonElements) {
          button.click()
        }
        await sleep(50)
        for (const file of files) {
          const fakeEvent = {
            dataTransfer: { files: [file] },
            preventDefault: () => {},
            stopPropagation: () => {},
          }
          getReactProps(this.dropZoneElement).onDrop(fakeEvent)
        }
      })
    }
  }
}
