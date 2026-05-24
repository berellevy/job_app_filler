import { useCallback, useEffect, useState } from 'react'
import { HsJobMatch, sendHsMessage } from '../../types'

export interface HsMatchHook {
  /** undefined = not yet resolved; null = resolved-empty; object = found */
  match: HsJobMatch | null | undefined
  error: string | null
  refresh: () => void
}

export const useHsMatch = (
  url: string | null,
  enabled: boolean
): HsMatchHook => {
  const [match, setMatch] = useState<HsJobMatch | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  const fetchMatch = useCallback(async () => {
    if (!enabled || !url) {
      setMatch(null)
      return
    }
    setMatch(undefined)
    setError(null)
    const res = await sendHsMessage<HsJobMatch | null>({
      type: 'HS_MATCH',
      url,
    })
    if (!res.ok) {
      setError(res.error.message)
      setMatch(null)
      return
    }
    setMatch(res.data ?? null)
  }, [url, enabled])

  const refresh = useCallback(() => {
    void fetchMatch()
  }, [fetchMatch])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { match, error, refresh }
}
