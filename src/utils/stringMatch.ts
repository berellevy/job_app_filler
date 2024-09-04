type StringMatchConfig = {
  caseSensitive?: boolean
  /** countKeywords specific */
  threshold?: number
}

interface StringMatcher<ReturnType = boolean> {
  (str1: string, str2: string, config?: StringMatchConfig): ReturnType
}

const defaultConfig: StringMatchConfig = {
  caseSensitive: true,
  threshold: 1,
}
function prepStrings(...args: [...(string | null)[], StringMatchConfig]): string[] {
  const config = { ...defaultConfig, ...(args.pop() as StringMatchConfig) }
  let strs = args as string[]
  
  if (config?.caseSensitive) {
    strs = strs.map((str) => (str || "").toLowerCase())
  }
  return strs
}

export const countMatchingStartCharacters: StringMatcher<number> = (
  str1,
  str2
) => {
  let matchCount = 0
  const minLength = Math.min(str1.length, str2.length)
  for (let i = 0; i < minLength; i++) {
    if (str1[i] === str2[i]) {
      matchCount++
    } else {
      break
    }
  }
  return matchCount
}

export const countMatchingEndCharacters: StringMatcher<number> = (
  str1,
  str2,
  config = {}
) => {
  ;[str1, str2] = prepStrings(str1, str2, config)
  let matchCount = 0
  const minLength = Math.min(str1.length, str2.length)

  for (let i = 1; i <= minLength; i++) {
    if (str1[str1.length - i] === str2[str2.length - i]) {
      matchCount++
    } else {
      break
    }
  }
  return matchCount
}

export const exact: StringMatcher = (str1, str2, config = {}) => {
  ;[str1, str2] = prepStrings(str1, str2, config)
  return str1 === str2
}

export const ignore: StringMatcher<true> = (str1, str2, config = {}) => {
  ;[str1, str2] = prepStrings(str1, str2, config)
  return true
}

export const startsWith: StringMatcher = (str1, str2, config = {}) => {
  ;[str1, str2] = prepStrings(str1, str2, config)
  return str1.startsWith(str2)
}

export const isPrefix: StringMatcher = (str1, str2, config = {}) => {
  ;[str1, str2] = prepStrings(str1, str2, config)
  return str2.startsWith(str1)
}

export const endsWith: StringMatcher = (str1, str2, config = {}) => {
  ;[str1, str2] = prepStrings(str1, str2, config)
  return str1.endsWith(str2)
}

export const isSuffix: StringMatcher = (str1, str2, config = {}) => {
  ;[str1, str2] = prepStrings(str1, str2, config)
  return str2.endsWith(str1)
}

export const contains: StringMatcher = (str1, str2, config = {}) => {
  ;[str1, str2] = prepStrings(str1, str2, config)
  return str1.includes(str2)
}

/**
 * Count how many keywords str1 contains. Split str2 into keywords by comma, pipe or space.
 * @param config.threshold: how many matches to find before returning. defaults to 1
 */
export const keywordCount: StringMatcher<number> = (
  str1,
  str2,
  config = {}
) => {
  config = {...defaultConfig, ...config}
  ;[str1, str2] = prepStrings(str1, str2, config)
  const splitters = /[,| ]/
  let count = 0
  const keywords = str2.split(splitters)
  for (const kw of keywords) {
    if (str1.includes(kw)) {
      count++
      if (config.threshold && count >= config.threshold) return count
    }
  }
  return count
}
