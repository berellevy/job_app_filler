import { sleep } from '@src/shared/utils/async'
import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import {
  getElement,
  getElements,
} from '@src/shared/utils/getElements'
import { AnswerValueMethods } from '../baseFormInput'
import { WorkdayBaseInput } from './WorkdayBaseInput'
import { AnswerValueMultiFileUpload } from '../../../MoreInfoPopup/AnswerDisplay/AnswerValueDisplay/AnswerValueMultiFileUpload'
import {
  LocalStorageFile,
  localStorageToFile,
} from '@src/shared/utils/file'
import { isEqual } from 'lodash'
import { getReactProps } from '../utils'
import { xpaths } from './xpaths'
import { saveButtonClickHandlers } from '../../../hooks/saveButtonClickHandlers'

export class FileMulti extends WorkdayBaseInput<any> {
  fieldType = 'MultiFileUpload'
  public saveButtonClickHandler = saveButtonClickHandlers.withNotice
  fieldNotice = [
    `##### To save and autofill files, upload them in the 'Answers' section below.
    \n\n[See how](https://www.youtube.com/watch?v=JYMATq9siIY&t=134s)`,
  ].join('')
  static XPATH = xpaths.MULTI_FILE_UPLOAD

  get answerValue() {
    return {
      ...super.answerValue,
      displayComponent: AnswerValueMultiFileUpload,
    } as AnswerValueMethods
  }

  listenForChanges(): void {
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      const fileAdded = getElement(
        mutations,
        `self::*[@data-automation-id= "file-upload-successful"]`,
        { only: 'addedNodes' }
      )
      const fileRemoved = getElement(
        mutations,
        `self::*[@data-automation-id= "file-upload-item"]`,
        { only: 'removedNodes' }
      )
      if (fileAdded || fileRemoved) {
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
    await fieldFillerQueue.enqueue(async () => {
      const answer = (await this.answer()) || []
      if (answer.length > 0) {
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
      }
    })
  }
}
