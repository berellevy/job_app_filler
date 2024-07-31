import { sleep } from './async'

/**
 * Find the first HTMLElemetn by a given xpath
 */
export const getElement = (parent: Node, path: string): HTMLElement => {
  const node = document.evaluate(
    path,
    parent,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue
  return node as HTMLElement
}

/**
 * Find multiple HTMLElements by a given xpath.
 */
export const getElements = (parent: Node, path: string): HTMLElement[] => {
  const iterator = document.evaluate(
    path,
    parent,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  )
  const result = []
  for (let i = 0; i < iterator.snapshotLength; i++) {
    result.push(iterator.snapshotItem(i))
  }
  return result
}

type WaitForElementOptions = {
  /**
   * only return if a new element shows up,
   * but not if a matching element was already there when the function was called
   */
  onlyNew?: boolean
  timeout?: number
}

/**
 * if target exists before this function is called, return it.
 * Otherwise, create an observer.
 * @param onlyNew: only return if a new element shows up,
 * but not if a matching element was already there when the function was called
 */
export const waitForElement = (
  parent: Node,
  path: string,
  { onlyNew = false, timeout = 3000 }: WaitForElementOptions = {}
): Promise<HTMLElement | null> => {
  return new Promise((resolve, reject) => {
    const target = getElement(parent, path)
    if (!onlyNew && target) {
      return resolve(target)
    }
    const observer = new MutationObserver((mutations, observer) => {
      const target = getElement(parent, path)
      if (target) {
        observer.disconnect()
        clearTimeout(timer)
        resolve(target)
      }
    })
    const timer = setTimeout(() => {
      observer.disconnect()
      resolve(null)
    }, timeout)
    observer.observe(parent, { childList: true, subtree: true })
  })
}
