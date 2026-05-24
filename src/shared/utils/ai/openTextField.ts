// Adapted from Br1an67/OpenJobAutofill (MIT). https://github.com/Br1an67/OpenJobAutofill

/**
 * Detection of "open-text" / long-answer fields — textareas, contenteditable
 * regions, and single-line inputs whose maxlength is large enough that a
 * free-text answer is expected (e.g. "Why do you want to work here?").
 *
 * The thresholds below are adapted from OpenJobAutofill's control-type
 * classification; the rest is original to fit our editable-element model.
 */

/**
 * A single-line text input is only treated as open-text when it permits a
 * reasonably long answer. Short inputs (names, phone, postcode) are excluded.
 */
const OPEN_TEXT_MIN_MAXLENGTH = 120

const UNCONSTRAINED_MAXLENGTH = -1

const isTextLikeInput = (element: HTMLInputElement): boolean => {
  const type = (element.type || 'text').toLowerCase()
  return type === 'text' || type === 'search' || type === ''
}

/**
 * Returns the maxlength of an input, or {@link UNCONSTRAINED_MAXLENGTH} when
 * unset. An unconstrained text input is treated as potentially open-text.
 */
const readMaxLength = (element: HTMLInputElement): number => {
  const raw = element.getAttribute('maxlength')
  if (raw === null) {
    return UNCONSTRAINED_MAXLENGTH
  }
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) ? parsed : UNCONSTRAINED_MAXLENGTH
}

/**
 * True when the element is a long-form / open-text answer field that the AI
 * answer generator can fill. Textareas and contenteditable regions always
 * qualify; single-line inputs only when their maxlength is large or absent.
 */
export const isOpenTextField = (element: Element): boolean => {
  if (element instanceof HTMLTextAreaElement) {
    return true
  }

  if (element instanceof HTMLElement && element.isContentEditable) {
    return true
  }

  if (element instanceof HTMLInputElement) {
    if (!isTextLikeInput(element)) {
      return false
    }
    const maxLength = readMaxLength(element)
    return (
      maxLength === UNCONSTRAINED_MAXLENGTH ||
      maxLength >= OPEN_TEXT_MIN_MAXLENGTH
    )
  }

  return false
}

/**
 * Best-effort soft character cap for the generated answer, derived from the
 * element's maxlength. Returns `undefined` when there is no usable limit.
 */
export const openTextMaxLength = (element: Element): number | undefined => {
  if (element instanceof HTMLInputElement) {
    const maxLength = readMaxLength(element)
    return maxLength > 0 ? maxLength : undefined
  }
  if (element instanceof HTMLTextAreaElement) {
    const maxLength = element.maxLength
    return maxLength > 0 ? maxLength : undefined
  }
  return undefined
}
