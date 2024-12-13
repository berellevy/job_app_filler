import fieldFillerQueue from "@src/shared/utils/fieldFillerQueue";
import { getElement, getElements } from "@src/shared/utils/getElements";

import { GreenhouseReactBaseInput } from "./GreenhouseReactBaseInput";
import { xpaths } from "./xpaths";
import { CheckboxWrapperContainer } from "./ElementWrappers/CheckboxWrapperContainer";
import AnswerDTO from "../../DTOs/AnswerDTO";

export class CheckboxMulti extends GreenhouseReactBaseInput {
  static XPATH = xpaths.CHECKBOX_MULTI
  fieldType = "Dropdown"

  get labelElement(): HTMLElement {
    return getElement(
      this.element,
      `.//legend[starts-with(@class, "label")]`
    )
  }

  listenForChanges(): void {
    this.element.addEventListener("click", (e) => {
      const { tagName } = (e.target as HTMLElement)
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

  async fill(answers: AnswerDTO<string>[]): Promise<void> {
    await fieldFillerQueue.enqueue(async () => {
      const choiceElements = this.choiceElements
      choiceElements.forEach(el => el.uncheck())
      for (const storedAnswer of answers) {
        const correctChoice = this.choiceElements.find(el => el.value === storedAnswer.answer)
        if (correctChoice) {
          correctChoice.check()
          break
        }
      }
    })
  }
}

