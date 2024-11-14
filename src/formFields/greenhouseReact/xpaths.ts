export const TEXT_INPUT = [
  `.//div[@class="text-input-wrapper"]`,
  `[.//input[@type="text"]]`,
].join("")

export const TEXTAREA = [
  `.//div[@class="text-input-wrapper"]`,
  `[.//textarea]`,
].join("")

export const FILE = [
  `.//div[@class="file-upload"]`,
].join("")

export const DROPDOWN = [
  `.//div`,
  `[@class="select"]`,
  `[.//button[@aria-label="Toggle flyout"]]`,
  `[not(.//div[contains(@class, "is-multi")])]`,
].join("")

export const DROPDOWN_SEARCHABLE = [
  `.//div`,
  `[@class="select"]`,
  `[not(.//button[@aria-label="Toggle flyout"])]`,
  `[not(.//div[contains(@class, "is-multi")])]`,
].join("")

export const DROPDOWN_MULTI = [
  `.//div`,
  `[@class="select"]`,
  `[.//button[@aria-label="Toggle flyout"]]`,
  `[.//div[contains(@class, "is-multi")]]`,
].join("")

export const CHECKBOX_MULTI = [
  `.//fieldset`,
  `[@class="checkbox"]`,
  `[count(.//input[@type="checkbox"]) > 1]`,
].join("")

export const CHECKBOX_BOOLEAN = [
  `.//fieldset`,
  `[@class="checkbox"]`,
  `[count(.//input[@type="checkbox"]) = 1]`,
].join("")