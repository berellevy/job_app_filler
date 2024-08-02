/**
 * couldn't get timers/promises to work...
 */
export const sleep = (timeout: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, timeout))
}
