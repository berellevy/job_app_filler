import { useCallback, useEffect, useState } from 'react'
import {
  HsAuthStatus,
  HsCandidate,
  sendHsMessage,
} from '../../types'

export interface HsAuthHook {
  hasPat: boolean
  authLoading: boolean
  authError: string | null
  candidate: HsCandidate | null
  candidateError: string | null
  candidateLoading: boolean
  refresh: () => void
}

export const useHsAuth = (): HsAuthHook => {
  const [hasPat, setHasPat] = useState<boolean>(false)
  const [authLoading, setAuthLoading] = useState<boolean>(true)
  const [authError, setAuthError] = useState<string | null>(null)

  const [candidate, setCandidate] = useState<HsCandidate | null>(null)
  const [candidateError, setCandidateError] = useState<string | null>(null)
  const [candidateLoading, setCandidateLoading] = useState<boolean>(false)

  const fetchStatus = useCallback(async () => {
    setAuthLoading(true)
    setAuthError(null)
    const res = await sendHsMessage<HsAuthStatus>({ type: 'HS_AUTH_STATUS' })
    setAuthLoading(false)
    if (!res.ok) {
      setAuthError(res.error.message)
      setHasPat(false)
      return false
    }
    setHasPat(res.data.hasPat)
    return res.data.hasPat
  }, [])

  const fetchCandidate = useCallback(async () => {
    setCandidateLoading(true)
    setCandidateError(null)
    const res = await sendHsMessage<HsCandidate>({ type: 'HS_CANDIDATE' })
    setCandidateLoading(false)
    if (!res.ok) {
      setCandidate(null)
      setCandidateError(res.error.message)
      return
    }
    setCandidate(res.data)
  }, [])

  const refresh = useCallback(() => {
    void (async () => {
      const ok = await fetchStatus()
      if (ok) {
        await fetchCandidate()
      } else {
        setCandidate(null)
        setCandidateError(null)
      }
    })()
  }, [fetchStatus, fetchCandidate])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    hasPat,
    authLoading,
    authError,
    candidate,
    candidateError,
    candidateLoading,
    refresh,
  }
}
