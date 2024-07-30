import { getElement } from '../../utils/getElements'
import { BaseFormInput } from '../baseFormInput'

export abstract class WorkdayBaseInput<
  AnswerType
> extends BaseFormInput<AnswerType> {
  public get section(): string {
    // must always return a string, even a blank one
    const XPATH = [
      'ancestor::div', // ancestor div
      `[//div[@job-app-filler='${this.uuid}']]`, // that contains this element (i.e. this form field's containing div.)
      '[1]', // first div to match this criteria
      '//h4', // get the h4 child of the above div
    ].join('')
    const element = getElement(this.element, XPATH)
    return element?.innerText || ''
  }
}
