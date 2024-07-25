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