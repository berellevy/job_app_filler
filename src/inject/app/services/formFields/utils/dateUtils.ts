export function dateCompare(date1: string[], date2: string[]): boolean {
  if (date1.length !== date2.length) {
    return false
  }
  for (let i = 0; i < date1.length; i++) {
    if (date1[i] !== date2[i]) {
      return false
    }
  }
  return true
}