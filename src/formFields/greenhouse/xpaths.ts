export const TEXT_FIELD = [
  ".//div[@class='field']",
  "[(./input[@type='text']) | (./label/input[@type='text']) ]"
].join("")

export const SINGLE_FILE_UPLOAD = [
  ".//div[@class='field']",
  "[.//div[contains(@class, 'drop-zone')]]"
].join("")

export const ADDRESS_SEARCH_FIELD = [
  ".//div[@class='field']",
  "[.//auto-complete]",
].join("")


export const SIMPLE_DROPDOWN = [
  ".//div[@class='field']",
  "[.//select]"
].join("")