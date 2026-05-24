/**
 * XPaths for SmartRecruiters job application forms.
 *
 * SmartRecruiters is a React-based ATS. The apply form lives under
 * `form[data-test-id="application-form"]` (or `.application-form` as a
 * legacy fallback) on URLs matching `*.smartrecruiters.com`.
 *
 * Field-detection strategy: anchor each XPath on the visible wrapper
 * the React app renders for that field (so the injected widget can sit
 * next to the label), then sub-select the actual `<input>` / `<select>`
 * / drop-zone inside.
 *
 * Selector patterns confirmed against open-source SmartRecruiters
 * adapters that ship today (oks-citadel/Apply, ShousenZHANG/joblit).
 */
export const xpaths = {
  /**
   * Wrapper around any standard text-like input rendered by SR
   * (firstName, lastName, location, etc.). We deliberately exclude
   * email/tel/file/linkedin so they can be claimed by more-specific
   * adapters first.
   */
  TEXT_FIELD: [
    `.//div[contains(@class, "form-group") or contains(@class, "field")]`,
    `[.//label]`,
    `[.//input[@type="text"]]`,
    `[not(.//input[contains(translate(@name,"LINKEDU","linkedu"), "linkedin")])]`,
    `[not(.//input[contains(translate(@placeholder,"LINKEDU","linkedu"), "linkedin")])]`,
  ].join(""),

  /**
   * LinkedIn URL is a `<input type="url">` (or text input whose name /
   * placeholder mentions linkedin). Handled separately because SR
   * sometimes URL-validates and we want a dedicated fieldType for
   * reporting.
   */
  LINKEDIN_URL: [
    `.//div[contains(@class, "form-group") or contains(@class, "field")]`,
    `[.//label]`,
    `[.//input[`,
    `@type="url"`,
    ` or contains(translate(@name,"LINKEDU","linkedu"), "linkedin")`,
    ` or contains(translate(@placeholder,"LINKEDU","linkedu"), "linkedin")`,
    `]]`,
  ].join(""),

  /**
   * Phone field. SR renders a country-code prefix select alongside a
   * tel input inside the same form-group. We pick up the whole group
   * and let the Phone adapter target the tel input.
   */
  PHONE: [
    `.//div[contains(@class, "form-group") or contains(@class, "field")]`,
    `[.//label]`,
    `[.//input[@type="tel"]]`,
  ].join(""),

  /**
   * Native `<select>` dropdown (country, salutation, per-posting
   * single-choice question).
   */
  DROPDOWN: [
    `.//div[contains(@class, "form-group") or contains(@class, "field")]`,
    `[.//label]`,
    `[.//select]`,
  ].join(""),

  /**
   * Resume / file upload. SR exposes a hidden `<input type="file">`
   * plus a drop-zone `<div>` users can drag onto.
   */
  FILE: [
    `.//div[contains(@class, "form-group") or contains(@class, "field") or contains(@class, "file-upload")]`,
    `[.//input[@type="file"]]`,
  ].join(""),
} as const

export type SmartRecruitersXPath = (typeof xpaths)[keyof typeof xpaths]
