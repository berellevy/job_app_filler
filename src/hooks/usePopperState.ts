import {
  MutableRefObject,
  Dispatch,
  SetStateAction,
  MouseEvent,
  useRef,
  useState,
} from 'react'
import { BaseFormInput } from '../formFields/baseFormInput'

export type PopperState = {
  anchorRef: MutableRefObject<any>
  anchorEl: HTMLElement
  setAnchorEl: Dispatch<SetStateAction<HTMLElement>>
  isOpen: boolean
  close: () => void
  open: () => void
  handleToggleButtonClick: (e: MouseEvent<HTMLElement>) => void
}

export const usePopperState = (backend: BaseFormInput<any>): PopperState => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const anchorRef = useRef(null)
  const isOpen = Boolean(anchorEl)

  const open = () => {
    setAnchorEl(anchorRef.current)
  }

  const close = () => {
    setAnchorEl(null)
  }

  const handleToggleButtonClick = (e: MouseEvent<HTMLElement>) => {
    if (!isOpen) {
      open()
    } else if (e.currentTarget.contains(e.target as Node)) {
      close()
    }
  }

  return {
    anchorEl,
    setAnchorEl,
    anchorRef,
    isOpen,
    open,
    close,
    handleToggleButtonClick,
  }
}
