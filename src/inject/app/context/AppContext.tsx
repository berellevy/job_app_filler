import React, {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { BaseFormInput } from '../services/formFields/baseFormInput'
import { usePopperState } from '../hooks/usePopperState'
import { AppContextType } from './types'
import useAnswerState from '../hooks/useAnswerState'

const AppContext = createContext<AppContextType>(null)

export const useAppContext = () => useContext(AppContext)

export const ContextProvider: FC<{
  children: ReactNode
  backend: BaseFormInput<any>
}> = ({ children, backend }) => {
  const [currentValue, setCurrentValue] = useState<any>(null)
  const [fillButtonDisabled, setFillButtonDisabled] = useState<boolean>(false)
  const answers = useAnswerState(backend)
  
  const { fieldNotice, saveButtonClickHandler } = backend
  const [hasFilledOnce, setHasFilledOnce] = useState<boolean>(false)


  useEffect(() => {
    if (answers.initialized && !hasFilledOnce) {
      ;(async () => {
        await handleFill()
        setHasFilledOnce(true)
      })()
    }
    refreshCurrentValue()
  }, [answers.data, hasFilledOnce])



  useEffect(() => {
    backend.element.addEventListener(backend.reactMessageEventId, refreshCurrentValue)
    return () => {
      backend.element.removeEventListener(backend.reactMessageEventId, refreshCurrentValue)
    }
  }, [])


  const init = async () => {
    // await editableAnswerState.init()
    await refreshCurrentValue()
  }

  const refreshCurrentValue = useCallback(async () => {
    setCurrentValue(backend.currentValue())
  }, [])

  const isFilled =
    answers.data.length > 0 &&
    backend.isFilled(
      currentValue,
      answers.data.map(({answer}) => answer)
      
    )

  const deleteAnswer: AppContextType['deleteAnswer'] = async (id: number) => {
    await backend.deleteAnswer(id)
    await refreshCurrentValue()
  }

  const handleFill = async () => {
    setFillButtonDisabled(true)
    try {
      if (answers.data.length > 0) {
        await backend.fill(answers.data)
        await refreshCurrentValue()
      }
    } finally {
      setFillButtonDisabled(false)
    }
  }

  const moreInfoPopper = usePopperState({ init, backend })
  const value: AppContextType = {
    backend,
    refreshCurrentValue,
    init,
    answers,
    deleteAnswer,
    currentValue,
    setCurrentValue,
    isFilled,
    moreInfoPopper,
    fieldNotice,
    fillButton: {
      isDisabled: fillButtonDisabled,
      onClick: handleFill,
      isFilled
    },
    saveButton: {
      showSuccessBadge: answers.data.length > 0,
      clickHandler: () => {
        saveButtonClickHandler(currentValue, {
          moreInfoPopper,
          answers
        })
      },
    },
  }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
