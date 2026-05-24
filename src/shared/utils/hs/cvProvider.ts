/**
 * Page-scoped store for the matched job's HiredSignal CV.
 *
 * The autofill bar fetches the per-job CV (via the HS_CV message) once a match
 * is confirmed and stashes the decoded File here. Every file-upload adapter
 * then prefers this CV over the user's locally-saved answer, so the form is
 * filled with the CV tailored to the specific job rather than a generic one.
 *
 * State is module-level (per content-script world) and intentionally simple:
 * there is at most one matched job per page load.
 */

let currentCv: File | null = null

export const setHsCv = (f: File | null): void => {
  currentCv = f
}

export const getHsCv = (): File | null => currentCv

/**
 * Decode raw base64 file bytes (no `data:` prefix) into a File. Mirrors the
 * `bytesBase64` contract of HsCvFile.
 */
export const base64ToFile = (
  base64: string,
  filename: string,
  contentType: string
): File => {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new File([bytes], filename, { type: contentType })
}
