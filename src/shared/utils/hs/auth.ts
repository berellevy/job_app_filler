/**
 * PAT storage/retrieval. The PAT lives ONLY in the background SW's
 * chrome.storage.local — never in content scripts or inject scripts.
 *
 * The PAT format is `hs_pat_<token>`; we don't validate the body, only
 * the presence of the prefix.
 */

const PAT_KEY = 'hs_pat'
const BASE_URL_KEY = 'hs_base_url'
const DEFAULT_BASE_URL = 'https://hiredsignal.com'
const PAT_PREFIX = 'hs_pat_'

export interface HsAuthStatus {
  authenticated: boolean
  /** Empty string when unauthenticated. The full PAT is never returned. */
  patMasked: string
}

function maskPat(pat: string): string {
  if (pat.length <= PAT_PREFIX.length + 4) return PAT_PREFIX + '****'
  return pat.slice(0, PAT_PREFIX.length + 2) + '…' + pat.slice(-3)
}

function getLocal<T>(key: string): Promise<T | undefined> {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (items) => {
      resolve(items[key] as T | undefined)
    })
  })
}

function setLocal(key: string, value: unknown): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => resolve())
  })
}

function removeLocal(key: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove([key], () => resolve())
  })
}

export async function getPat(): Promise<string | null> {
  const value = await getLocal<string>(PAT_KEY)
  if (typeof value !== 'string' || value.length === 0) return null
  return value
}

export async function setPat(pat: string): Promise<void> {
  const trimmed = pat.trim()
  if (!trimmed.startsWith(PAT_PREFIX)) {
    throw new Error(`PAT must start with "${PAT_PREFIX}"`)
  }
  await setLocal(PAT_KEY, trimmed)
}

export async function clearPat(): Promise<void> {
  await removeLocal(PAT_KEY)
}

export async function getAuthStatus(): Promise<HsAuthStatus> {
  const pat = await getPat()
  if (!pat) return { authenticated: false, patMasked: '' }
  return { authenticated: true, patMasked: maskPat(pat) }
}

export async function getBaseUrl(): Promise<string> {
  const value = await getLocal<string>(BASE_URL_KEY)
  if (typeof value !== 'string' || value.length === 0) return DEFAULT_BASE_URL
  // Strip trailing slash so callers can always do `${base}/api/...`.
  return value.endsWith('/') ? value.slice(0, -1) : value
}
