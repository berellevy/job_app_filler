/**
 * used for case insensetive matching.
 */
export function lowerText(): string {
  return "translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')"
}

export function endsWith(attribute: string, value: string): string {
  return `substring(${attribute}, string-length(${attribute}) - string-length('${value}') + 1) = '${value}'`
}