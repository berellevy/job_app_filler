/**
 * XPath selectors for the Ashby application form
 * (https://jobs.ashbyhq.com/{company}/{job-uuid}/application).
 *
 * Ashby is a React-heavy app that renders fields inside generic
 * "field-entry" wrappers (label + control). Class names are
 * minified/styled-component-generated, so we anchor on stable
 * attributes: `id` / `name` (which carry the field path, e.g.
 * `_systemfield_email`), `data-testid`, `type`, and the relationship
 * between `<label>` and its labelled control.
 *
 * Every selector resolves the PARENT WRAPPER element (label + control)
 * so that `BaseFormInput.labelElement` can still walk to the `<label>`.
 */

export type AshbyXPathKey =
  | 'TEXT_INPUT'
  | 'PHONE'
  | 'LINKEDIN_URL'
  | 'DROPDOWN'
  | 'FILE'

/**
 * A wrapper div that contains exactly one `<label>` and one text-like
 * `<input>` (text/email/tel/url). We intentionally exclude file inputs,
 * phone inputs (handled by PHONE), and inputs whose name signals a URL
 * field (handled by LINKEDIN_URL) so that each XPath has a single owner.
 */
const TEXT_INPUT_XPATH: string = [
  `.//div[`,
  `.//label`,
  ` and .//input[`,
  `(@type="text" or @type="email" or not(@type))`,
  ` and not(@type="file")`,
  ` and not(@type="tel")`,
  ` and not(contains(translate(@name, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "linkedin"))`,
  ` and not(contains(translate(@id,   "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "linkedin"))`,
  `]`,
  ` and not(.//select)`,
  ` and not(.//textarea)`,
  `]`,
].join('')

const PHONE_XPATH: string = [
  `.//div[`,
  `.//label`,
  ` and .//input[@type="tel"]`,
  `]`,
].join('')

const LINKEDIN_URL_XPATH: string = [
  `.//div[`,
  `.//label`,
  ` and .//input[`,
  `(@type="url" or @type="text")`,
  ` and (`,
  `contains(translate(@name, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "linkedin")`,
  ` or contains(translate(@id,   "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "linkedin")`,
  `)`,
  `]`,
  `]`,
].join('')

/**
 * Single-select dropdowns. Ashby renders these as either a real
 * `<select>` element (simple posts) or a styled combobox div
 * (`role="combobox"`). Both shapes carry a `<label>`.
 */
const DROPDOWN_XPATH: string = [
  `.//div[`,
  `.//label`,
  ` and (`,
  `.//select`,
  ` or .//*[@role="combobox"]`,
  `)`,
  `]`,
].join('')

/**
 * Resume / cover letter upload. Ashby wraps a hidden `<input type=file>`
 * in a styled drop zone. We anchor on the file input itself and walk up
 * to the wrapper that contains the label.
 */
const FILE_XPATH: string = [
  `.//div[`,
  `.//input[@type="file"]`,
  ` and .//label`,
  `]`,
].join('')

export const xpaths: Record<AshbyXPathKey, string> = {
  TEXT_INPUT: TEXT_INPUT_XPATH,
  PHONE: PHONE_XPATH,
  LINKEDIN_URL: LINKEDIN_URL_XPATH,
  DROPDOWN: DROPDOWN_XPATH,
  FILE: FILE_XPATH,
}
