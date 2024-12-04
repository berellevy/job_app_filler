export const xpaths = {
  TEXT_INPUT: [
    `.//div[@class="text-input-wrapper"]`,
    `[.//input[@type="text"]]`,
  ].join(''),

  NUMBER_INPUT: [
    `.//div[@class="text-input-wrapper"]`,
    `[.//input[@type="number"]]`,
  ].join(''),

  TEXTAREA: [`.//div[@class="text-input-wrapper"]`, `[.//textarea]`].join(''),

  FILE: [`.//div[@class="file-upload"]`].join(''),

  DROPDOWN: [
    `.//div`,
    `[@class="select"]`,
    `[.//button[@aria-label="Toggle flyout"]]`,
    `[not(.//div[contains(@class, "is-multi")])]`,
  ].join(''),

  DROPDOWN_SEARCHABLE: [
    `.//div`,
    `[@class="select"]`,
    `[.//button[@aria-label="Toggle flyout"]]`,
    `[not(.//div[contains(@class, "is-multi")])]`,
  ].join(''),

  ADDRESS_SEARCHABLE: [
    `.//div`,
    `[@class="select"]`,
    `[not(.//button[@aria-label="Toggle flyout"])]`,
  ].join(""),

  DROPDOWN_MULTI_SEARCHABLE: [
    `.//div`,
    `[@class="select"]`,
    `[.//button[@aria-label="Toggle flyout"]]`,
    `[.//div[contains(@class, "is-multi")]]`,
  ].join(''),

  CHECKBOX_MULTI: [
    `.//fieldset`,
    `[@class="checkbox"]`,
    `[count(.//input[@type="checkbox"]) > 1]`,
  ].join(''),

  CHECKBOX_BOOLEAN: [
    `.//fieldset`,
    `[@class="checkbox"]`,
    `[count(.//input[@type="checkbox"]) = 1]`,
  ].join(''),
}
