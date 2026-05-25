/**
 * HiredSignal API response types + hand-rolled validators.
 *
 * Zod is not in the project's deps, so every response from the HS API is
 * narrowed via explicit type guards before it crosses the boundary into
 * application code. NO trust-the-API.
 */

export interface HsCandidate {
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  linkedinUrl: string
  siteUrl: string
  languages: string[]
}

export type HsMatchType = 'exact' | 'host+path' | 'host' | null

export interface HsMatch {
  jobUid: string
  slug: string
  applyUrl: string
  matchType: HsMatchType
  cvMaterialId: string | null
  candidate: HsCandidate
}

export interface HsCvFile {
  /** base64-encoded file bytes (raw, no data: prefix) */
  bytesBase64: string
  contentType: string
  filename: string | null
}

/** A form field the extension scraped, to be answered server-side by the LLM. */
export interface HsFillField {
  id: string
  label: string
  type: string
  options?: string[]
  maxLength?: number
}

export interface HsFillAnswer {
  id: string
  value: string
}

export interface HsFillResult {
  answers: HsFillAnswer[]
}

export type HsErrorCode =
  | 'unauthenticated'
  | 'not_found'
  | 'network'
  | 'invalid_response'
  | 'server'

export interface HsError {
  code: HsErrorCode
  message: string
}

export type HsResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: HsError }

// -- Type guards ------------------------------------------------------------

const isString = (v: unknown): v is string => typeof v === 'string'
const isStringOrNull = (v: unknown): v is string | null =>
  v === null || typeof v === 'string'

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every(isString)

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

export function isHsCandidate(v: unknown): v is HsCandidate {
  if (!isRecord(v)) return false
  return (
    isString(v.firstName) &&
    isString(v.lastName) &&
    isString(v.email) &&
    isString(v.phone) &&
    isString(v.location) &&
    isString(v.linkedinUrl) &&
    isString(v.siteUrl) &&
    isStringArray(v.languages)
  )
}

function isHsMatchType(v: unknown): v is HsMatchType {
  return v === null || v === 'exact' || v === 'host+path' || v === 'host'
}

export function isHsMatch(v: unknown): v is HsMatch {
  if (!isRecord(v)) return false
  return (
    isString(v.jobUid) &&
    isString(v.slug) &&
    isString(v.applyUrl) &&
    isHsMatchType(v.matchType) &&
    isStringOrNull(v.cvMaterialId) &&
    isHsCandidate(v.candidate)
  )
}
