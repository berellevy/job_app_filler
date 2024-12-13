import { EditableAnswerState } from "../hooks/useEditableAnswerState"
import { PopperState } from "../hooks/usePopperState"
import { BaseFormInput } from "../services/formFields/baseFormInput"

export type FillButtonState = {
    isDisabled: boolean
    onClick: () => Promise<void>
    isFilled: boolean
}

export type LocalAnswer = [string, Boolean]



export interface AppContextType {
  backend: BaseFormInput<any>
  refresh: () => Promise<void>
  init: () => Promise<void>
  fillButton: FillButtonState
  saveButton: SaveButtonState
  deleteAnswer: (id: number) => Promise<void>
  currentValue: any
  setCurrentValue: (_: any) => void
  isFilled: boolean
  editableAnswerState: EditableAnswerState
  moreInfoPopper: PopperState

  fieldNotice: string | null
}

export type SaveButtonState = {
    showSuccessBadge: boolean
    clickHandler: () => void
  }