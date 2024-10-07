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
    ].join('')

    /**
     * different method found occasionally
     */
    const secondaryXpath = [ 
      'ancestor::div[@role="group"][1]', // nearest ancestor div roll group
      `[.//div[@job-app-filler='${this.uuid}']]`, // the above div/fieldset element must contain this forminput's main element.
      "[1]",
      "//h4[@id]" // h4 needs an id attribute because repeating sections will reference that id, but non-repeating sections with h4s won't.
    ].join("")

    return `(${primaryXpath} | ${secondaryXpath})`
  }


  get sectionLabelElement(): HTMLElement {
    return getElement(this.element, this.sectionLabelXpath)
  }
  public get section(): string {
    // must always return a string, even a blank one.
    return this.sectionLabelElement?.innerText || ''
  }
}
