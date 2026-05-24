import { useCallback, useEffect, useState } from 'react'
import {
  AI_CONFIG_STORAGE_KEY,
  AiAnswerConfig,
  DEFAULT_AI_ANSWER_CONFIG,
} from '@src/shared/utils/ai/types'

export interface AiConfigHook {
  config: AiAnswerConfig
  loading: boolean
  error: string | null
  /** Reloads the persisted config from chrome.storage.local. */
  refresh: () => void
  /** Merges a partial update over the defaults and persists it. */
  save: (next: AiAnswerConfig) => Promise<boolean>
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  return 'Unexpected storage error'
}

/**
 * Reads a stored value and merges it over {@link DEFAULT_AI_ANSWER_CONFIG} so
 * older/partial saved shapes always resolve to a complete config. Unknown input
 * is narrowed defensively — we never trust storage content blindly.
 */
const mergeStored = (stored: unknown): AiAnswerConfig => {
  if (typeof stored !== 'object' || stored === null) {
    return { ...DEFAULT_AI_ANSWER_CONFIG }
  }
  const candidate = stored as Record<string, unknown>
  const pickString = (key: keyof AiAnswerConfig, fallback: string): string =>
    typeof candidate[key] === 'string' ? (candidate[key] as string) : fallback
  return {
    enabled:
      typeof candidate.enabled === 'boolean'
        ? candidate.enabled
        : DEFAULT_AI_ANSWER_CONFIG.enabled,
    baseUrl: pickString('baseUrl', DEFAULT_AI_ANSWER_CONFIG.baseUrl),
    endpointPath: pickString(
      'endpointPath',
      DEFAULT_AI_ANSWER_CONFIG.endpointPath
    ),
    apiKey: pickString('apiKey', DEFAULT_AI_ANSWER_CONFIG.apiKey),
    model: pickString('model', DEFAULT_AI_ANSWER_CONFIG.model),
    temperature:
      typeof candidate.temperature === 'number'
        ? candidate.temperature
        : DEFAULT_AI_ANSWER_CONFIG.temperature,
  }
}

const readConfig = (): Promise<AiAnswerConfig> =>
  new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(AI_CONFIG_STORAGE_KEY, (items) => {
        const runtimeError = chrome.runtime?.lastError
        if (runtimeError) {
          reject(new Error(runtimeError.message))
          return
        }
        resolve(mergeStored(items?.[AI_CONFIG_STORAGE_KEY]))
      })
    } catch (error: unknown) {
      reject(error instanceof Error ? error : new Error(getErrorMessage(error)))
    }
  })

const writeConfig = (config: AiAnswerConfig): Promise<void> =>
  new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set({ [AI_CONFIG_STORAGE_KEY]: config }, () => {
        const runtimeError = chrome.runtime?.lastError
        if (runtimeError) {
          reject(new Error(runtimeError.message))
          return
        }
        resolve()
      })
    } catch (error: unknown) {
      reject(error instanceof Error ? error : new Error(getErrorMessage(error)))
    }
  })

export const useAiConfig = (): AiConfigHook => {
  const [config, setConfig] = useState<AiAnswerConfig>({
    ...DEFAULT_AI_ANSWER_CONFIG,
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    setLoading(true)
    setError(null)
    readConfig()
      .then((loaded) => {
        setConfig(loaded)
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err))
        setConfig({ ...DEFAULT_AI_ANSWER_CONFIG })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const save = useCallback(async (next: AiAnswerConfig): Promise<boolean> => {
    setError(null)
    try {
      await writeConfig(next)
      setConfig(next)
      return true
    } catch (err: unknown) {
      setError(getErrorMessage(err))
      return false
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { config, loading, error, refresh, save }
}
