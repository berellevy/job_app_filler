export const xpaths = {
  TEXT_FIELD: [
    ".//div[@class='field']",
    "[(./input[@type='text']) | (./label/input[@type='text']) ]",
  ].join(''),

  SINGLE_FILE_UPLOAD: [
    ".//div[@class='field']",
    "[.//div[contains(@class, 'drop-zone')]]",
  ].join(''),

  ADDRESS_SEARCH_FIELD: [".//div[@class='field']", '[.//auto-complete]'].join(
    ''
  ),

  SIMPLE_DROPDOWN: [
    ".//div[@class='field']",
    "[.//div[contains(@class, 'select2-container')]]",
    "[not(.//div[contains(@class, 'select2-container-multi')])]",
    `[.//select]`,
  ].join(''),


  DROPDOWN_MULTI: [
    ".//div[@class='field']",
    "[.//div[contains(@class, 'select2-container-multi')]]",
    `[.//select]`,
  ].join(''),

  DROPDOWN_SEARCHABLE: [
    ".//div[@class='field']",
    "[.//div[contains(@class, 'select2-container')]]",
    `[not(.//select)]`,
  ].join(''),

  BASIC_SELECT: [
    ".//div[@class='field']",
    '[.//select]',
    "[not(.//div[contains(@class, 'select2-container')])]",
  ].join(''),

  TEXTAREA: [".//div[@class='field']", '[.//textarea]'].join(''),

  MULTI_CHECKBOX: [
    ".//div[starts-with(@class, 'field')]",
    "[count(.//input[@type='checkbox']) > 1]",
  ].join(''),

  MONTH_YEAR: [
    ".//div[@class='field']",
    `[.//input[@type="text"][@placeholder="MM"]]`,
    `[.//input[@type="text"][@placeholder="YYYY"]]`,
  ].join(''),
}
