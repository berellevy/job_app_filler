export const FORM_TEXT_INPUT = `
.//div
[starts-with(@data-automation-id, 'formField-')]
[.//input[@type='text'] or .//input[@type='password']]
[not(.//*[@aria-haspopup])]
`