import React, { FC } from 'react'
import { getElement, getElements } from '@src/shared/utils/getElements'
import '@fontsource/roboto'
import { v4 as uuid4 } from 'uuid'
import { Answer, FieldPath } from '@src/shared/utils/types'
import { AnswerValueSingleString } from '../../MoreInfoPopup/AnswerDisplay/AnswerValueDisplay/AnswerValueSingleString'
import stringMatch from '@src/shared/utils/stringMatch'
import { App } from '../../App'
import { SaveButtonClickHndler, saveButtonClickHandlers } from '../../hooks/saveButtonClickHandlers'
import { EditableAnswer, useEditableAnswerState } from '../../hooks/useEditableAnswerState'
import { contentScriptAPI } from '../contentScriptApi'

export type AnswerValueMethods = {
  displayComponent: FC<{ id: number }>
  init: (_: any) => any
  prepForSave: (_: any) => any
  prepForFill: (answers: EditableAnswer[]) => any[]
}

export function isRegistered(el: HTMLElement): boolean {
  return el.hasAttribute('job-app-filler')
}

export function isVisible(el: HTMLElement): boolean {
  return el.getBoundingClientRect().height > 0
}

export abstract class BaseFormInput<AnswerType> {
  public editableAnswerHook = useEditableAnswerState
  public saveButtonClickHandler: SaveButtonClickHndler =
    saveButtonClickHandlers.basic
  /** Supports Markdown */
  fieldNotice: string | null
  fieldNoticeLink: {
    url: string
    display: string
  }

  public get answerValue(): AnswerValueMethods {
    return {
      displayComponent: AnswerValueSingleString,
      init: (answer) => structuredClone(answer),
      prepForSave: (_) => _,
      prepForFill: (answers) => answers.map((a) => a.originalAnswer.answer),
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

  abstract attachReactApp(
    app: React.ReactNode,
    inputContainer: HTMLElement
  ): void

  constructor(element: HTMLElement) {
    this.element = element
    this.uuid = uuid4()
    this.reactMessageEventId = `reactMessage-${this.uuid}`
    /** prevents the element from being registered twice */
    this.element.setAttribute('job-app-filler', this.uuid)
    this.listenForChanges()
    this.attachReactApp(<App backend={this} />, element)
  }

  static async autoDiscover(node: Node = document) {
    const elements = getElements(node, this.XPATH)
    elements.forEach((el) => {
      if (isRegistered(el)) {
        return
      }
        // @ts-ignore
        new this(el)
    })
  }

  /**
   * Listen for changes on the form field of the job site.
   * Logic depends on field structure
   * call `triggerReactUpdate` on each change.
   * This method is ususally field specific.
   */
  abstract listenForChanges(): void

  /**
   * communicate with the react display element by dispatching
   * an event on the form field parent element for which the react
   * display element is listening for.
   */
  triggerReactUpdate() {
    this.element.dispatchEvent(new CustomEvent(this.reactMessageEventId))
  }

  public get page(): string {
    return getElement(document, './/h2')?.innerText || ''
  }

  /**
   * can sometimes be overriden but is mostly the same.
   * Default is first nonblank label or legend.
   */

  get labelElement(): HTMLElement {
    const XPATH = [
      './/*[self::label or self::legend]',
      "[.//text()[(normalize-space() != '')]]",
    ].join('')
    return getElement(this.element, XPATH)
  }
  public get fieldName(): string {
    return this.labelElement?.innerText
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

  public get fieldSnapshot(): Answer {
    return {
      path: this.path,
      answer: this.currentValue(),
    }
  }

  async save(answer: Answer): Promise<Answer> {
    const response = await contentScriptAPI.send('saveAnswer', answer)
    return response.data
  }

  async deleteAnswer(id: number): Promise<boolean> {
    const res = await contentScriptAPI.send('deleteAnswer', id)
    return res.ok
  }

  async answer(path?: FieldPath): Promise<Answer[]> {
    path = path || this.path
    const res = await contentScriptAPI.send('getAnswer', path)
    if (res.ok) {
      return res.data
    } else {
      console.log(res, this.path)
      return []
    }
  }

  public clickIsInFormfield(e: PointerEvent) {
    return e.composedPath().includes(this.element)
  }

  public isFilled(current: any, stored: any[]): boolean {
    return stored.some((answer) => stringMatch.exact(current, answer))
  }

  /**
   * general logic that applies to all fields.
   *
   * for most fields it's enough to put the actual filling logic in the `fillField` method.
   */
  abstract fill(): Promise<void>
}
