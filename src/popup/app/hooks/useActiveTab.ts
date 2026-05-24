import { useCallback, useEffect, useState } from 'react'

export interface ActiveTab {
  id: number | null
  url: string | null
}

const NULL_TAB: ActiveTab = { id: null, url: null }

/**
 * Returns the current active tab's id + url. Re-resolves on demand via `refresh`.
 * Tolerant of permission and lifecycle errors — degrades to NULL_TAB rather than throwing.
 */
export const useActiveTab = (): {
  tab: ActiveTab
  loading: boolean
  refresh: () => void
} => {
  const [tab, setTab] = useState<ActiveTab>(NULL_TAB)
  const [loading, setLoading] = useState<boolean>(true)

  const refresh = useCallback(() => {
    setLoading(true)
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const first = tabs?.[0]
        if (!first || typeof first.id !== 'number') {
          setTab(NULL_TAB)
        } else {
          setTab({ id: first.id, url: first.url ?? null })
        }
        setLoading(false)
      })
    } catch {
      setTab(NULL_TAB)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { tab, loading, refresh }
}
