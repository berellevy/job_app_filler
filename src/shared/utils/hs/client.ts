/**
 * Typed HiredSignal API client. Runs in the background SW only — content
 * and inject scripts must go through the message bus (see ./messages.ts).
 *
 * REWIRED (2026-05-25): the original contract (PAT auth + /api/extension/match,
 * /candidate, /cv) was never built on the backend. This client now uses the
 * user's logged-in COOKIE session against the endpoints that actually exist:
 *   - POST /api/graphql { importedJobs }          → match apply-page URL → job
 *   - GET  /api/me/materials?jobUid=…             → that job's CV material
 *   - GET  /api/me/materials/{id}?content=1       → the CV bytes
 *   - GET  /api/me/profile                        → identity fields
 *
 * All functions return HsResult<T> instead of throwing.
 */

import { getBaseUrl } from './auth'
import {
  HsCandidate,
  HsCvFile,
  HsErrorCode,
  HsFillAnswer,
  HsFillField,
  HsFillResult,
  HsMatch,
  HsMatchType,
  HsResult,
} from './types'

function err<T>(code: HsErrorCode, message: string): HsResult<T> {
  return { ok: false, error: { code, message } }
}

function ok<T>(data: T): HsResult<T> {
  return { ok: true, data }
}

interface JsonAttempt {
  data: unknown
  error: { code: HsErrorCode; message: string } | null
}

async function getJson(path: string, init?: RequestInit): Promise<JsonAttempt> {
  const base = await getBaseUrl()
  let res: Response
  try {
    res = await fetch(`${base}${path}`, {
      method: (init && init.method) || 'GET',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        ...((init && init.headers) || {}),
      },
      body: init && init.body,
      credentials: 'include',
      redirect: 'follow',
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'fetch failed'
    return { data: null, error: { code: 'network', message: msg } }
  }
  if (res.status === 401 || res.status === 403) {
    return { data: null, error: { code: 'unauthenticated', message: 'Not signed in to HiredSignal' } }
  }
  if (!res.ok) {
    return { data: null, error: { code: 'server', message: `HTTP ${res.status}` } }
  }
  try {
    return { data: await res.json(), error: null }
  } catch {
    return { data: null, error: { code: 'invalid_response', message: 'invalid JSON' } }
  }
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : {}
}

function asString(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

// -- URL matching -----------------------------------------------------------

function urlKey(u: string): string {
  try {
    const x = new URL(u)
    return (x.host + x.pathname).toLowerCase().replace(/\/apply.*$/, '').replace(/\/+$/, '')
  } catch {
    return (u || '').toLowerCase()
  }
}

// Requisition tokens shared between a posting URL and its apply URL
// (Workday JR100984, Greenhouse 4399567002, etc.).
function reqTokens(u: string): string[] {
  const m = (u || '').match(/[a-z]{1,4}\d{5,}|\b\d{6,}\b/gi)
  return m ? m.map((s) => s.toLowerCase()) : []
}

// -- Candidate (profile) ----------------------------------------------------

async function fetchProfileCandidate(): Promise<HsCandidate> {
  const empty: HsCandidate = {
    firstName: '', lastName: '', email: '', phone: '',
    location: '', linkedinUrl: '', siteUrl: '', languages: [],
  }
  const r = await getJson('/api/me/profile')
  if (r.error) return empty
  const d = asRecord(r.data)
  const p = asRecord(d.profile)
  const langsRaw = Array.isArray(p.languages) ? p.languages : []
  const languages: string[] = langsRaw
    .map((x: unknown) => (typeof x === 'string' ? x : asString(asRecord(x).language)))
    .filter((s: string) => s.length > 0)
  return {
    firstName: asString(p.firstName),
    lastName: asString(p.lastName),
    email: asString(d.email) || asString(p.email),
    phone: asString(p.phone),
    location: asString(p.location),
    linkedinUrl: asString(p.linkedinUrl),
    siteUrl: asString(p.siteUrl) || asString(p.website),
    languages,
  }
}

export async function fetchCandidate(): Promise<HsResult<HsCandidate>> {
  return ok(await fetchProfileCandidate())
}

// -- Match: apply-page URL → tracked job → its CV ---------------------------

interface ImportedJobLite {
  id: string
  url: string
  sourceUrl: string
  title: string
  company: string
}

async function findCvMaterialId(jobRawId: string): Promise<string | null> {
  // The materials store may key the job as the raw id or "import-<id>".
  for (const ju of [jobRawId, `import-${jobRawId}`]) {
    const mr = await getJson(`/api/me/materials?jobUid=${encodeURIComponent(ju)}`)
    if (mr.error) continue
    const rows = asRecord(mr.data).rows
    if (!Array.isArray(rows)) continue
    for (const row of rows) {
      const r = asRecord(row)
      if (asString(r.kind) === 'cv') return asString(r.id)
    }
  }
  return null
}

export async function fetchMatch(applyUrl: string): Promise<HsResult<HsMatch>> {
  const candidate = await fetchProfileCandidate()

  const jr = await getJson('/api/graphql', {
    method: 'POST',
    body: JSON.stringify({
      query: '{ importedJobs { id url sourceUrl title company } }',
    }),
  })
  if (jr.error) return err(jr.error.code, jr.error.message)

  const payload = asRecord(jr.data)
  const dataField = asRecord(payload.data)
  const rawJobs = Array.isArray(dataField.importedJobs) ? dataField.importedJobs : []
  const jobs: ImportedJobLite[] = rawJobs.map((j: unknown) => {
    const r = asRecord(j)
    return {
      id: asString(r.id),
      url: asString(r.url),
      sourceUrl: asString(r.sourceUrl),
      title: asString(r.title),
      company: asString(r.company),
    }
  })

  const pageKey = urlKey(applyUrl)
  const pageReqs = reqTokens(applyUrl)
  let best: { job: ImportedJobLite; score: number; mt: HsMatchType } | null = null

  for (const job of jobs) {
    for (const c of [job.url, job.sourceUrl]) {
      if (!c) continue
      const key = urlKey(c)
      const reqs = reqTokens(c)
      let score = 0
      let mt: HsMatchType = null
      if (key && key === pageKey) { score += 10; mt = 'host+path' }
      else if (key && pageKey && (pageKey.indexOf(key) >= 0 || key.indexOf(pageKey) >= 0)) { score += 6; mt = 'host' }
      if (pageReqs.some((r) => reqs.indexOf(r) >= 0)) { score += 8; mt = 'exact' }
      if (score > (best ? best.score : 0)) best = { job, score, mt }
    }
  }

  if (!best || best.score < 6) {
    return err('not_found', 'No tracked HiredSignal job matches this page URL')
  }

  const cvMaterialId = await findCvMaterialId(best.job.id)
  const slug = best.job.title + (best.job.company ? ` — ${best.job.company}` : '')
  return ok({
    jobUid: best.job.id,
    slug,
    applyUrl,
    matchType: best.mt,
    cvMaterialId,
    candidate,
  })
}

// -- CV bytes ---------------------------------------------------------------

function bytesToBase64(buf: ArrayBuffer): string {
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
  const base = await getBaseUrl()
  const safeId = encodeURIComponent(materialId)
  let res: Response
  try {
    res = await fetch(`${base}/api/me/materials/${safeId}?content=1`, {
      method: 'GET',
      credentials: 'include',
      redirect: 'follow',
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'fetch failed'
    return err('network', msg)
  }
  if (res.status === 401 || res.status === 403) {
    return err('unauthenticated', 'Not signed in to HiredSignal')
  }
  if (!res.ok) {
    return err('server', `HTTP ${res.status} ${res.statusText}`)
  }
  let buf: ArrayBuffer
  try {
    buf = await res.arrayBuffer()
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'failed to read body'
    return err('network', msg)
  }
  const contentType = res.headers.get('content-type') || 'application/octet-stream'
  const filename = filenameFromContentDisposition(res.headers.get('content-disposition'))
  return ok({ bytesBase64: bytesToBase64(buf), contentType, filename })
}

// -- LLM field fill: send scraped fields, get back answers ------------------

export async function fetchFill(
  jobUid: string,
  fields: HsFillField[]
): Promise<HsResult<HsFillResult>> {
  const r = await getJson('/api/extension/fill', {
    method: 'POST',
    body: JSON.stringify({ jobUid, fields }),
  })
  if (r.error) return err(r.error.code, r.error.message)
  const payload = asRecord(r.data)
  const rawAnswers = Array.isArray(payload.answers) ? payload.answers : []
  const answers: HsFillAnswer[] = []
  for (const a of rawAnswers) {
    const rec = asRecord(a)
    const id = asString(rec.id)
    const value = asString(rec.value)
    if (id) answers.push({ id, value })
  }
  return ok({ answers })
}
