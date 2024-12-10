import { AnswerValueSingleBool } from "../../../MoreInfoPopup/AnswerDisplay/AnswerValueDisplay/AnswerValueSingleBool";
import fieldFillerQueue from "@src/shared/utils/fieldFillerQueue";
import { getElement } from "@src/shared/utils/getElements";
import { AnswerValueMethods } from "../baseFormInput";
import { GreenhouseReactBaseInput } from "./GreenhouseReactBaseInput";
import { xpaths } from "./xpaths";
import { CheckboxWrapperContainer } from "./ElementWrappers/CheckboxWrapperContainer";


export class CheckboxBoolean extends GreenhouseReactBaseInput<any> {
  static XPATH = xpaths.CHECKBOX_BOOLEAN
  fieldType: string = 'SingleCheckbox'
  public answerValueDisplayComponent = AnswerValueSingleBool
  public get answerValue() {
    return {
      ...super.answerValue,
      displayComponent: AnswerValueSingleBool
    } as AnswerValueMethods
  }

  get labelElement(): HTMLElement {
    return this.element
  }

  get labelDisplayElement() {
    return getElement(this.element, `.//legend`)
  }

  listenForChanges(): void {
    this.element.addEventListener("click", (e) => {
      const {tagName} = (e.target as HTMLElement)
      if (tagName === "INPUT") {
        this.triggerReactUpdate() 
      }
    })
  }

  currentValue() {
    return this.checkboxWrapper.checked
  }

  get checkboxWrapper(): CheckboxWrapperContainer {
    const el = getElement(
      this.element,
      `.//div[@class="checkbox__wrapper"]`
    )
    return new CheckboxWrapperContainer(el)
  }

  public isFilled(current: any, stored: any[]): boolean {
    return current === stored[0]
  }

  async fill(): Promise<void> {
    await fieldFillerQueue.enqueue(async () => {
      const answers = await this.answer()
      if (answers.length > 0) {
        const firstAnswer = answers[0].answer
        if (!(this.currentValue === firstAnswer)) {
          this.checkboxWrapper.check()
        }
      }
    })
  }
}