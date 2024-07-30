export const TEXT_INPUT = `
  .//div
  [starts-with(@data-automation-id, 'formField-')]
  [.//input[@type='text']]
  [not(.//*[@aria-haspopup])]
`

export const PASSWORD_INPUT = `
  .//div
  [starts-with(@data-automation-id, 'formField-')]
  [.//input[@type='password']]
  [not(.//*[@aria-haspopup])]
`

export const SIMPLE_DROPDOWN = `
  .//div
  [starts-with(@data-automation-id, 'formField-')]
  [.//button[@aria-haspopup='listbox']] 
`

/**
 * As of now there are only 2, how did you hear about us and country phone code.
 * otherwise this field is identical to a searchable multi dropdown.
 * But the functionality is very different.
 */
export const SEARCHABLE_SINGLE_DROPDOWN = [
  './/div',
  "[(@data-automation-id='formField-sourcePrompt') or (@data-automation-id='formField-country-phone-code')]",
  "[.//div[@data-automation-id='multiSelectContainer']]",
].join('')
