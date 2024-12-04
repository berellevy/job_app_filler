import {
  MutableRefObject,
  Dispatch,
  SetStateAction,
  MouseEvent,
  useRef,
  useState,
  useEffect,
} from 'react'
import { AppContextType } from '../AppContext'


export type PopperState = {
  anchorRef: MutableRefObject<any>
  popperRef: MutableRefObject<any>
  anchorEl: HTMLElement
  setAnchorEl: Dispatch<SetStateAction<HTMLElement>>
  isOpen: boolean
  close: () => void
  open: () => void
  handleToggleButtonClick: (e: MouseEvent<HTMLElement>) => void
  handleRefreshButtonClick: () => Promise<void>
  isRefreshing: boolean
  fieldType: string
}

function isInRect(
  x: number,
  y: number,
  rects: DOMRect[],
  margin: number = 0
): boolean {
  return rects.some((rect) => {
    return (
      rect &&
      x >= rect.left - margin &&
      x <= rect.right + margin &&
      y >= rect.top - margin &&
      y <= rect.bottom + margin
    )
  })
}

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    e.preventDefault()
    close()
    document.removeEventListener('keyup', handleEscape)
  }
}

export const usePopperState = ({init, backend}: Pick<AppContextType, "init" | "backend">): PopperState => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const anchorRef = useRef(null)
  const popperRef = useRef(null)
  const isOpen = Boolean(anchorEl)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  
  const handleRefreshButtonClick = async () => {
    setIsRefreshing(true)
    await init()
    setIsRefreshing(false)
  }

  const handleClickAway = (e: PointerEvent) => {
    const { x, y } = e
    const rects = [,
      popperRef.current?.getBoundingClientRect(),
    ]
    const isInModal = () => e.composedPath().some((el: HTMLElement) => {
      return el?.classList?.contains("MuiModal-root")
    })
    const isInside = isInRect(x, y, rects) || backend.clickIsInFormfield(e) || isInModal()
    if (!isInside) {
      document.removeEventListener('click', handleClickAway)
      close()
    }
  }

  const open = () => {
    setAnchorEl(anchorRef.current)
  }

  const close = () => {
    setAnchorEl(null)
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keyup', handleEscape)
      document.addEventListener('click', handleClickAway)
    }
    return () => {
      document.removeEventListener('keyup', handleEscape)
      document.removeEventListener('click', handleClickAway)
    }
  }, [isOpen])

  const handleToggleButtonClick = (e: MouseEvent<HTMLElement>) => {
    if (!isOpen) {
      open()
    } else if (e.currentTarget.contains(e.target as Node)) {
      close()
    }
  }

  return {
    anchorEl,
    popperRef,
    setAnchorEl,
    anchorRef,
    isOpen,
    open,
    close,
    handleToggleButtonClick,
    handleRefreshButtonClick,
    isRefreshing,
    fieldType: backend.fieldType
  }
}
