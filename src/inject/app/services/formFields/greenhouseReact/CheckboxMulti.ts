import { AnswerValueBackupStrings } from "../../../MoreInfoPopup/AnswerDisplay/AnswerValueDisplay/AnswerValueBackupStrings";

import fieldFillerQueue from "@src/shared/utils/fieldFillerQueue";
import { getElement, getElements } from "@src/shared/utils/getElements";

import { GreenhouseReactBaseInput } from "./GreenhouseReactBaseInput";
import { xpaths } from "./xpaths";
import { answerValueInitList } from "../../../hooks/answerValueInit";
import { EditableAnswer } from "../../../hooks/useEditableAnswerState";
import { CheckboxWrapperContainer } from "./ElementWrappers/CheckboxWrapperContainer";

export class CheckboxMulti extends GreenhouseReactBaseInput<any> {
  static XPATH = xpaths.CHECKBOX_MULTI
  fieldType = "SimpleDropdown"
  public get answerValue() {
    return {
      ...super.answerValue,
      displayComponent: AnswerValueBackupStrings,
      init: answerValueInitList,
      prepForSave: (values: [string, boolean][]) => {
        return values.map(([value, editable]) => value)
      },
      prepForFill: (answers: EditableAnswer[]): string[] => {
        return super.answerValue.prepForFill(answers).flat()
      },
    }
  }
  public get fieldSnapshot() {
    return {
      path: this.path,
      answer: [this.currentValue()],
    }
  }

  get labelElement(): HTMLElement {
    return getElement(
      this.element,
      `.//legend[starts-with(@class, "label")]`
    )
  }

  listenForChanges(): void {
    this.element.addEventListener("click", (e) => {
      const {tagName} = (e.target as HTMLElement)
      if (tagName === "INPUT") {
        this.triggerReactUpdate() 
      }
    })
  }

  /**
   * for now treat multis like singles.
   */
  currentValue() {
    const firstSelectedElement = this.choiceElements.find(el => el.checked)
    return firstSelectedElement?.value || ""
  }

  get choiceElements(): CheckboxWrapperContainer[] {
    return getElements(
      this.element,
      `.//div[@class="checkbox__wrapper"]`
    ).map((el) => new CheckboxWrapperContainer(el))
  }

  public isFilled(current: any, stored: any[]): boolean {
    return stored.includes(current)
  }

  async fill(): Promise<void> {
    await fieldFillerQueue.enqueue(async () => {
      const answers = await this.answer()
      if (answers.length > 0) {
        const choiceElements = this.choiceElements
        choiceElements.forEach(el => el.uncheck())
        for (const storedAnswer of answers) {
          const correctChoice = this.choiceElements.find(el => el.value === storedAnswer.answer[0])
          if (correctChoice) {
            correctChoice.check()
            break
          }
        }
      }
    })
  }
}

