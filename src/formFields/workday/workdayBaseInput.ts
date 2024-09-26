import { getElement } from '../../utils/getElements'
import { BaseFormInput } from '../baseFormInput'

export abstract class WorkdayBaseInput<
  AnswerType
> extends BaseFormInput<AnswerType> {
  get sectionLabelXpath(): string {

    const primaryXpath = [
      'ancestor::fieldset', // get the nearest ancestor fieldset element
      '/parent::div', // get parent div element of above fieldset element
      `[.//div[@job-app-filler='${this.uuid}']]`, // the above div/fieldset element must contain this forminput's main element.
      '[1]', // first (nearest) div/fieldset to match this criteria
      '//h4', // get the h4 child of the above div/fieldset. 
      // repeating field sections are the only ones that have an h4 afaik.
    ].join('')

    /**
     * archgroup workday is different.
     * not finishing the fix just yet.
     */
    const secondaryXpath = [ 
      'ancestor::div[2]',
      `[.//div[@job-app-filler='${this.uuid}']]`, // the above div/fieldset element must contain this forminput's main element.
      "[1]",
      "//h4"
    ].join("")

    return `(${primaryXpath})`
  }


  get sectionLabelElement(): HTMLElement {
    return getElement(this.element, this.sectionLabelXpath)
  }
  public get section(): string {
    // must always return a string, even a blank one.
    return this.sectionLabelElement?.innerText || ''
  }
}
