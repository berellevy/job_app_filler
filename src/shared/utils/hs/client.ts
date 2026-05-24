/**
 * Typed HiredSignal API client. Runs in the background SW only — content
 * and inject scripts must go through the message bus (see ./messages.ts).
 *
 * All functions return HsResult<T> instead of throwing, so callers can
 * pattern-match on the failure code without try/catch ceremony.
 */

import { getBaseUrl, getPat } from './auth'
import {
  HsCandidate,
  HsCvFile,
  HsErrorCode,
  HsMatch,
  HsResult,
  isHsCandidate,
  isHsMatch,
} from './types'

interface RawResponse {
  status: number
  headers: Headers
  body: ArrayBuffer
}

interface RawFailure {
  code: HsErrorCode
  message: string
}

/**
 * Internal helper return — uses nullable fields instead of a discriminated
 * union so it narrows cleanly without `strict` / `strictNullChecks` (which
 * the project's tsconfig does not enable).
 */
interface RawAttempt {
  data: RawResponse | null
  failure: RawFailure | null
}

function err<T>(code: HsErrorCode, message: string): HsResult<T> {
  return { ok: false, error: { code, message } }
}

function ok<T>(data: T): HsResult<T> {
  return { ok: true, data }
}

function statusToCode(status: number): HsErrorCode {
  if (status === 401 || status === 403) return 'unauthenticated'
  if (status === 404) return 'not_found'
  if (status >= 500) return 'server'
  return 'server'
}

function failed(code: HsErrorCode, message: string): RawAttempt {
  return { data: null, failure: { code, message } }
}

function succeeded(data: RawResponse): RawAttempt {
  return { data, failure: null }
}

async function authedFetch(path: string): Promise<RawAttempt> {
  const pat = await getPat()
  if (!pat) return failed('unauthenticated', 'No HiredSignal PAT configured')

  const base = await getBaseUrl()
  const url = `${base}${path}`

  let res: Response
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: 'application/json, application/octet-stream',
      },
      credentials: 'omit',
      redirect: 'follow',
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'fetch failed'
    return failed('network', msg)
  }

  let buf: ArrayBuffer
  try {
    buf = await res.arrayBuffer()
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'failed to read response body'
    return failed('network', msg)
  }

  if (!res.ok) {
    return failed(
      statusToCode(res.status),
      `HTTP ${res.status} ${res.statusText}`
    )
  }
  return succeeded({ status: res.status, headers: res.headers, body: buf })
}

function parseJson(buf: ArrayBuffer): unknown | null {
  try {
    const text = new TextDecoder('utf-8').decode(buf)
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

export async function fetchMatch(applyUrl: string): Promise<HsResult<HsMatch>> {
  const path = `/api/extension/match?url=${encodeURIComponent(applyUrl)}`
  const raw = await authedFetch(path)
  if (raw.failure) return err(raw.failure.code, raw.failure.message)
  const data = raw.data as RawResponse
  const parsed = parseJson(data.body)
  if (!isHsMatch(parsed)) {
    return err('invalid_response', 'Match response failed schema validation')
  }
  return ok(parsed)
}

export async function fetchCandidate(): Promise<HsResult<HsCandidate>> {
  const raw = await authedFetch('/api/extension/candidate')
  if (raw.failure) return err(raw.failure.code, raw.failure.message)
  const data = raw.data as RawResponse
  const parsed = parseJson(data.body)
  if (!isHsCandidate(parsed)) {
    return err('invalid_response', 'Candidate response failed schema validation')
  }
  return ok(parsed)
}

function bytesToBase64(buf: ArrayBuffer): string {
  // Chunked conversion — String.fromCharCode chokes on very large arg lists.
  const bytes = new Uint8Array(buf)
  const chunkSize = 0x8000
  let binary = ''
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode.apply(null, Array.from(slice))
  }
  return btoa(binary)
}

function filenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null
  // RFC 5987 first, then plain filename=
  const star = /filename\*\s*=\s*(?:UTF-8'')?([^;]+)/i.exec(header)
  if (star && star[1]) {
    try {
      return decodeURIComponent(star[1].trim().replace(/^"|"$/g, ''))
    } catch {
      return star[1].trim().replace(/^"|"$/g, '')
    }
  }
  const plain = /filename\s*=\s*"?([^";]+)"?/i.exec(header)
  if (plain && plain[1]) return plain[1].trim()
  return null
}

export async function fetchCv(materialId: string): Promise<HsResult<HsCvFile>> {
  const safeId = encodeURIComponent(materialId)
  const raw = await authedFetch(`/api/extension/cv/${safeId}`)
  if (raw.failure) return err(raw.failure.code, raw.failure.message)
  const data = raw.data as RawResponse
  const contentType =
    data.headers.get('content-type') || 'application/octet-stream'
  const filename = filenameFromContentDisposition(
    data.headers.get('content-disposition')
  )
  const bytesBase64 = bytesToBase64(data.body)
  return ok({ bytesBase64, contentType, filename })
}
