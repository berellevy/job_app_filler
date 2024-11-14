export const TEXT_INPUT = [
  `.//div[@class="text-input-wrapper"]`,
  `[.//input[@type="text"]]`,
].join("")

export const FILE = [
  `.//div[@class="file-upload"]`,
].join("")

export const DROPDOWN = [
  `.//div`,
  `[@class="select"]`,
  `[not(.//div[contains(@class, "is-multi")])]`,
].join("")

export const DROPDOWN_MULTI = [
  `.//div`,
  `[@class="select"]`,
  `[.//div[contains(@class, "is-multi")]]`,
].join("")