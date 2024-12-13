import React, {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { BaseFormInput } from '../services/formFields/baseFormInput'
import { EditableAnswerState } from '../hooks/useEditableAnswerState'
import { usePopperState } from '../hooks/usePopperState'
import { AppContextType } from './types'









const AppContext = createContext<AppContextType>(null)

export const useAppContext = () => useContext(AppContext)

export const ContextProvider: FC<{
  children: ReactNode
  backend: BaseFormInput<any>
}> = ({ children, backend }) => {
  const [currentValue, setCurrentValue] = useState<any>(null)
  const [fillButtonDisabled, setFillButtonDisabled] = useState<boolean>(false)
  // const [editableAnswer, setEditableAnswer] = useState<LocalAnswer[]>([])
  const editableAnswerState: EditableAnswerState =
    backend.editableAnswerHook(backend)
  const {fieldNotice} = backend
  
  

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

  const deleteAnswer: AppContextType['deleteAnswer'] = async (id: number) => {
    await backend.deleteAnswer(id)
    await refresh()
  }

  const handleFill = async () => {
    setFillButtonDisabled(true)
    try {
      await backend.fill()
      await refresh()
    } finally {
      setFillButtonDisabled(false)
    }
  }
  const {saveButtonClickHandler} = backend
  const moreInfoPopper = usePopperState({init, backend})
  const value: AppContextType = {
    backend,
    refresh,
    init,
    deleteAnswer,
    currentValue,
    setCurrentValue,
    isFilled,
    moreInfoPopper,
    editableAnswerState,
    fieldNotice,
    fillButton: {
      isDisabled: fillButtonDisabled,
      onClick: handleFill,
      isFilled: editableAnswerState.answers.length > 0 && isFilled,
    },
    saveButton: {
      showSuccessBadge: editableAnswerState.answers.length > 0,
      clickHandler: () => {
        saveButtonClickHandler(backend.fieldSnapshot, {
          moreInfoPopper,
          init,
          editableAnswerState,
          backend,
        })
      },
    },
  }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
