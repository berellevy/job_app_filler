import React, { FC, useEffect } from 'react'
import { useAppContext } from '../AppContext'
import { hsBarSingleton } from '../components/hsBarSingleton'

/**
 * Replaces the original per-field Fill/Save/MoreInfo button trio.
 *
 * In the HiredSignal model there is no per-field UI — the popup fetches a
 * tailored CV + candidate answers from the HiredSignal API, and a single
 * floating bar at the top of the page (see `HsAutofillBar`) drives autofill
 * across every detected field.
 *
 * We keep this component so adapter code under `services/formFields/` still
 * mounts a React subtree at each field (preserving the existing
 * `attachReactApp` lifecycle). On mount we register the backend with the
 * page-global HS bar; on unmount we deregister. Nothing visible is rendered.
 */
export const FieldWidgetButtons: FC = () => {
  const { backend } = useAppContext()
  useEffect(() => {
    hsBarSingleton.registerBackend(backend)
    return () => {
      hsBarSingleton.unregisterBackend(backend)
    }
  }, [backend])
  return null
}
