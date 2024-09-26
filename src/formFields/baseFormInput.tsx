import React, { FC } from 'react'
import { getElement, getElements } from '../utils/getElements'
import '@fontsource/roboto'
import {v4 as uuid4} from 'uuid'
import { client } from '../inject/inject'
import { App, attachReactApp } from '../App'
import { Answer, FieldPath} from '../utils/types'
import { saveButtonClickHandlers, SaveButtonClickHndler } from '../hooks/saveButtonClickHandlers'
import { EditableAnswer, useEditableAnswerState } from '../hooks/useEditableAnswerState'
import { AnswerValueSingleString } from '../components/AnswerValueDisplayComponents/AnswerValueSingleString'
import * as stringMatch from "../utils/stringMatch"






/**
 * given the regular dom element, get the props of the corresponding
 * react element. available as a property `__reactProps${random suffix}`
 * on the regular dom element
 */
export const getReactProps = (element: HTMLElement): any => {
  for (const key in element) {
    if (key.startsWith('__reactProps')) return element[key]
  }
}

export type AnswerValueMethods = {
  displayComponent: FC<{ id: number }>
  init: (_: any) => any
  prepForSave: (_: any) => any
  prepForFill: (answers: EditableAnswer[]) => any[]
}



export abstract class BaseFormInput<AnswerType> {
  public editableAnswerHook = useEditableAnswerState
  public saveButtonClickHandler: SaveButtonClickHndler = saveButtonClickHandlers.simpleText
  public get answerValue(): AnswerValueMethods {
    return {
      displayComponent: AnswerValueSingleString, 
      init: structuredClone,
      prepForSave: _=>_,
      prepForFill: (answers)=> answers.map(a => a.originalAnswer.answer)
    }
  }

  /**
   * The xpath used to identify the element.
   * Ususally an enclosing div since the label is contained within.
   */
  static XPATH: string
  /**
   * The parent element of the field. Should include the field and the
   * label.
   */
  element: HTMLElement
  uuid: string
  /**
   * used to send message events from this class to the rendered
   * react app.
   */
  reactMessageEventId: `reactMessage-${string}`
  /**
   * Should be the subclasses name. `this.constructor.name` doesn't
   * work because the name changes when the js is minified and this name
   * is used as part of the path to the answer.
   */
  fieldType: string


  /**
   * for fill errors.
   */
  public error: string | null

  constructor(element: HTMLElement) {
    this.element = element
    this.uuid = uuid4()
    this.reactMessageEventId = `reactMessage-${this.uuid}`
    /** prevents the element from being registered twice */
    this.element.setAttribute('job-app-filler', this.uuid)
    this.listenForChanges()
    attachReactApp(<App backend={this} />, element)
  }

  static async autoDiscover(node: Node = document) {
    
    const elements = getElements(node, this.XPATH)
    elements.forEach((el) => {
      if (!el.hasAttribute('job-app-filler')) {
        // @ts-ignore
        const input = new this(el)
      }
    })
  }

  /**
   * Listen for changes on the form field of the job site.
   * Logic depends on field structure
   * call `triggerReactUpdate` on each change.
   * This method is ususally field specific.
   */
  abstract listenForChanges(): void 
  // {
  //   throw new Error(
  //     "'listenForChanges' method must be implemented by all subclasses of BaseFormInput"
  //   )
  // }

  /**
   * communicate with the react display element by dispatching
   * an event on the form field parent element for which the react
   * display element is listening for.
   */
  triggerReactUpdate() {
    this.element.dispatchEvent(new CustomEvent(this.reactMessageEventId))
  }

  public get page(): string {
    return getElement(document, './/h2')?.innerText || "" 
  }

  /**
   * can sometimes be overriden but is mostly the same.
   * Default is first nonblank label or legend.
   */
  public get fieldName(): string {
    const XPATH = [
      ".//*[self::label or self::legend]",
      "[.//text()[(normalize-space() != '')]]"
    ].join("")
    const element = getElement(this.element, XPATH)
    return element?.innerText
  }

  /**
   * A section is a grouping of fields that can be repeating
   * e.g. work history.
   * In such cases the form field name can appear twice on a page.
   * 
   * Job site specific
   */
  public get section(): string {
    // must always return a string, even a blank one
    return ''
  }

  public get path(): FieldPath {
    return {
      page: this.page,
      section: this.section,
      fieldType: this.fieldType,
      fieldName: this.fieldName,
    }
  }

  abstract currentValue(): any
  // {
  //   throw new Error(
  //     "Getter 'currentValue' must be implemented by all subclasses of BaseFormInput"
  //   )
  //   return ''
  // }

  public get fieldSnapshot(): Answer {
    return {
      path: this.path,
      answer: this.currentValue(),
    }
  }

  async save(answer: Answer): Promise<Answer> {
    const response = await client.send('saveAnswer', answer)
    return response.data
  }

  async deleteAnswer(path: FieldPath): Promise<boolean> {
    const res = await client.send('deleteAnswer', path)
    return res.ok
  }


  async answer(path?: FieldPath): Promise<Answer[]> {
    path = path || this.path
    const res = await client.send('getAnswer', path)
    if (res.ok) {
      return res.data
    } else {
      console.log(res, this.path);
      return []
    }
  }

  public clickIsInFormfield(e: PointerEvent) {
    return e.composedPath().includes(this.element)
  }



  public isFilled(current: any, stored: any[]): boolean {
    return stored.some(answer=>stringMatch.exact(current, answer))
  }

  /**
   * general logic that applies to all fields.
   * 
   * for most fields it's enough to put the actual filling logic in the `fillField` method.
   */
  abstract fill(): Promise<void> 


}