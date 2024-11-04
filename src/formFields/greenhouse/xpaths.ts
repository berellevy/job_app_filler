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

/**
 * some js mixed in, with overlays etc.
 */
export const SIMPLE_DROPDOWN = [
  ".//div[@class='field']",
  "[.//div[contains(@class, 'select2-container')]]"
].join("")

/**
 * super basic select.
 */
export const BASIC_SELECT = [
  ".//div[@class='field']",
  "[.//select]",
  "[not(.//div[contains(@class, 'select2-container')])]"
].join("")

export const TEXTAREA = [
  ".//div[@class='field']",
  "[.//textarea]"
]
.join("")

