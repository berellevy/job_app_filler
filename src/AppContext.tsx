import React, {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react'
import { BaseFormInput } from './formFields/baseFormInput'
import { Answer, FieldPath } from './utils/types'
import { PopperState, usePopperState } from './hooks/usePopperState'

import { SaveButtonClickHndler } from './hooks/saveButtonClickHandlers'
import { EditableAnswerState } from './hooks/useEditableAnswerState'

export type FillButtonState = {
  isDisabled: boolean
  onClick: () => Promise<void>
}

export type LocalAnswer = [string, Boolean]

export interface AppContextType {
  backend: BaseFormInput<any>
  refresh: () => Promise<void>
  init: () => Promise<void>
  fillButtonState: FillButtonState
  deleteAnswer: (id: number) => Promise<void>
  currentValue: any
  setCurrentValue: (_: any) => void
  isFilled: boolean
  editableAnswer: LocalAnswer[]
  setEditableAnswer: Dispatch<SetStateAction<LocalAnswer[]>>
  editableAnswerState: EditableAnswerState
  moreInfoPopper: PopperState
  saveButtonClickHandler: SaveButtonClickHndler
  fieldNotice: string | null
}

const AppContext = createContext<AppContextType>(null)

export const useAppContext = () => useContext(AppContext)

export const ContextProvider: FC<{
  children: ReactNode
  backend: BaseFormInput<any>
}> = ({ children, backend }) => {
  const [currentValue, setCurrentValue] = useState<any>(null)
  const [fillButtonDisabled, setFillButtonDisabled] = useState<boolean>(false)
  const [editableAnswer, setEditableAnswer] = useState<LocalAnswer[]>([])
  const editableAnswerState: EditableAnswerState =
    backend.editableAnswerHook(backend)
  const fieldNotice = backend.fieldNotice
  useEffect(() => {
    ;(async () => {
      await editableAnswerState.init()
      await refresh()
      await handleFill()
    })()
    backend.element.addEventListener(backend.reactMessageEventId, refresh)
    return () => {
      backend.element.removeEventListener(backend.reactMessageEventId, refresh)
    }
  }, [])

  const init = async () => {
    await editableAnswerState.init()
    await refresh()
  }

  const refresh = async () => {
    setCurrentValue(backend.currentValue())
  }
  
  const isFilled =
    editableAnswerState.answers.length > 0 &&
    backend.isFilled(
      backend.currentValue(),
      backend.answerValue.prepForFill(editableAnswerState.answers)
    )

  const deleteAnswer: AppContextType["deleteAnswer"] = async (id: number) => {
    await backend.deleteAnswer(id)
    await refresh()
  }

  const handleFill = async () => {
    setFillButtonDisabled(true)
    try {
      await backend.fill()
      await refresh()
    } finally{
      setFillButtonDisabled(false)
    }
  }

  const value: AppContextType = {
    backend,
    refresh,
    init,
    deleteAnswer,
    fillButtonState: {
      isDisabled: fillButtonDisabled,
      onClick: handleFill,
    },
    editableAnswer,
    setEditableAnswer,
    currentValue,
    setCurrentValue,
    isFilled,
    moreInfoPopper: usePopperState(backend),
    editableAnswerState,
    saveButtonClickHandler: backend.saveButtonClickHandler,
    fieldNotice,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
