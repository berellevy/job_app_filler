export const TEXT_FIELD = [
  ".//div[@class='field']",
  "[(./input[@type='text']) | (./label/input[@type='text']) ]"
].join("")

export const SINGLE_FILE_UPLOAD = [
  ".//div[@class='field']",
  "[.//div[contains(@class, 'drop-zone')]]"
].join("")