/**
 * XPath selectors for the iCIMS application form
 * (https://careers-{company}.icims.com/jobs/{id}/{slug}/job?mode=apply).
 *
 * iCIMS ships in two DOM generations that both appear in the wild:
 *
 *  1. "Classic" iCIMS — inputs carry `class="iCIMS_Input"`, fields live in
 *     table rows (`<tr>`) with the visible label in a sibling
 *     `<td class="iCIMS_Label"><label>…</label></td>`, and the field
 *     `name` follows the `applicant.<field>` convention
 *     (`applicant.firstname`, `applicant.lastname`, `applicant.email`,
 *     `applicant.phone`, `applicant.linkedin`).
 *     Source: chandrarup/SmartApplyAI extension/content.js (iCIMS scanner
 *     + label resolver) and hemanth2416-byte/formpilot src/adapters/icims.js
 *     (the full `applicant.*` → profile-key map).
 *
 *  2. "Talent Cloud" iCIMS — inputs expose `data-field-id="firstname"`
 *     alongside a plain `name="firstname"` and the resume control sits inside
 *     `div.iCIMS_AttachButton`.
 *     Source: aarjunm04/AI_Job_Automation_Agent auto_apply/ats_detector.py
 *     (`ATSType.ICIMS` profile: first/last/email/phone/resume/linkedin
 *     selectors, `is_multi_step=True`, next button `button.iCIMS_Button_Next`).
 *
 * Both generations are matched here so a single adapter covers either layout.
 * Each field XPath resolves to the enclosing row/cell/container so the React
 * "saved answer" widget can be anchored beside the field and the label is in
 * scope for `fieldName`.
 *
 * GAP (needs live verification on an authenticated apply page): iCIMS gates
 * anonymous DOM inspection, so the exact wrapper element for each field
 * (`<tr>` in classic vs `<div class="iCIMS_FormField">` in Talent Cloud) was
 * inferred from the OSS adapters above, not captured from a live page. The
 * selectors target the input `name`/`data-field-id`/`class`, which the OSS
 * sources agree on, so field resolution is robust even if the wrapper varies.
 */

/** Container holding a first-name input (classic `applicant.firstname` or Talent-Cloud `firstname`). */
const FIRST_NAME: string = [
  './/*[self::tr or self::div or self::li]',
  "[.//input[@name='applicant.firstname']",
  " or .//input[@name='firstname']",
  " or .//input[@data-field-id='firstname']]",
].join('')

/** Container holding a last-name input. */
const LAST_NAME: string = [
  './/*[self::tr or self::div or self::li]',
  "[.//input[@name='applicant.lastname']",
  " or .//input[@name='lastname']",
  " or .//input[@data-field-id='lastname']]",
].join('')

/** Container holding the email input. */
const EMAIL: string = [
  './/*[self::tr or self::div or self::li]',
  "[.//input[@name='applicant.email']",
  " or .//input[@name='applicant.emailaddress']",
  " or .//input[@name='email']",
  " or .//input[@data-field-id='email']]",
].join('')

/** Container holding the phone input. */
const PHONE: string = [
  './/*[self::tr or self::div or self::li]',
  "[.//input[@name='applicant.phone']",
  " or .//input[@name='applicant.phonenumber']",
  " or .//input[@name='applicant.cellphone']",
  " or .//input[@name='phone']",
  " or .//input[@data-field-id='phone']]",
].join('')

/** Container holding the LinkedIn URL input. */
const LINKEDIN_URL: string = [
  './/*[self::tr or self::div or self::li]',
  "[.//input[@name='applicant.linkedin']",
  " or .//input[@name='applicant.linkedinurl']",
  " or .//input[@data-field-id='linkedin']",
  " or .//input[contains(@placeholder, 'LinkedIn')]",
  " or .//input[contains(@placeholder, 'linkedin')]]",
].join('')

export const xpaths = {
  FIRST_NAME,
  LAST_NAME,
  EMAIL,
  PHONE,
  LINKEDIN_URL,

  /**
   * Single-select dropdown custom question. iCIMS renders custom questions
   * as native `<select>` controls with `id`/`name` of the form `rcfN`
   * (e.g. `rcf123`) where N is the recruiting-custom-field id.
   * Source: iCIMS custom-question convention (`rcf<N>`) noted in the task
   * brief and corroborated by the `name*="applicant"`/native-select scan in
   * SmartApplyAI's iCIMS branch.
   */
  CUSTOM_DROPDOWN: [
    './/*[self::tr or self::div or self::li]',
    "[.//select[starts-with(@name, 'rcf')]",
    " or .//select[starts-with(@id, 'rcf')]",
    " or .//select[starts-with(@name, 'applicant.')]]",
  ].join(''),

  /**
   * Resume / CV upload. iCIMS exposes a real `<input type="file">`; on the
   * Talent-Cloud layout it is wrapped by `div.iCIMS_AttachButton`. We target
   * the file input by id/name resume hints and fall back to the attach-button
   * wrapper for anchoring the widget.
   * Source: ats_detector.py `resume_upload_selector =
   * "input[type=file], div.iCIMS_AttachButton input"`; SmartApplyAI
   * `fillResumeUpload` sets `input.files` via `DataTransfer` + `change`.
   */
  FILE_UPLOAD: [
    './/*[self::tr or self::div or self::li]',
    "[.//input[@type='file']",
    "[contains(@id, 'resume') or contains(@name, 'resume')",
    " or contains(@id, 'attach') or contains(@name, 'attach')",
    " or ancestor::div[contains(@class, 'iCIMS_AttachButton')]]]",
  ].join(''),
} as const
