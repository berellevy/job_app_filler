/**
 * XPath selectors for the Lever application form
 * (https://jobs.lever.co/{company}/{job-uuid}/apply).
 *
 * Lever wraps every basic field inside `<li class="application-question">` /
 * `<li class="application-field">` style containers, with the visible
 * <input>/<textarea>/<select> identified by their unique `name` attribute
 * (e.g. `name`, `email`, `phone`, `urls[LinkedIn]`).
 *
 * Resume upload is a plain `<input type="file" id="resume-upload-input">`
 * inside `div.application-question[data-qa="resume-upload"]`.
 */
export const xpaths = {
  /** Single full-name input. */
  NAME: [
    ".//li[.//input[@name='name']]",
  ].join(''),

  /** Email input. */
  EMAIL: [
    ".//li[.//input[@name='email']]",
  ].join(''),

  /** Phone input — own class to allow phone-specific formatting later. */
  PHONE: [
    ".//li[.//input[@name='phone']]",
  ].join(''),

  /** Current company / organisation. */
  ORG: [
    ".//li[.//input[@name='org']]",
  ].join(''),

  /** LinkedIn URL field — Lever ships a dedicated `urls[LinkedIn]` input. */
  LINKEDIN_URL: [
    ".//li[.//input[@name='urls[LinkedIn]']]",
  ].join(''),

  /**
   * Other URL fields (GitHub, Portfolio, Other, Twitter, etc.) — Lever uses
   * the `urls[<label>]` naming convention for every link question.
   */
  OTHER_URL: [
    ".//li[.//input[starts-with(@name, 'urls[')]]",
    "[not(.//input[@name='urls[LinkedIn]'])]",
  ].join(''),

  /** Single-select dropdown inside a `cards[<uuid>][<field>]` custom question. */
  CUSTOM_DROPDOWN: [
    ".//li[contains(@class, 'application-question')]",
    "[.//select[starts-with(@name, 'cards[')]]",
  ].join(''),

  /** Resume / cover-letter file upload. */
  FILE_UPLOAD: [
    ".//div[contains(@class, 'application-question')]",
    "[.//input[@type='file'][@id='resume-upload-input']]",
  ].join(''),
} as const
