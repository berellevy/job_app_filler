import { sleep } from './async'

type GetElemementFromMutationConfig = {
  only?: 'addedNodes' | 'removedNodes'
}


/**
 * find an element matching `xpath` starting from `context`.
 * `context` can be any of `Node`, `MutationRecord` of arrays thereof.
 */
export function getElement(context: Node | Node[], xpath: string): HTMLElement
export function getElement(
  context: MutationRecord | MutationRecord[],
  xpath: string,
  config?: GetElemementFromMutationConfig
): HTMLElement
export function getElement(context, xpath: string, config = {}) {
  if (context instanceof Node) {
    return getElementFromNode(context, xpath)
  } else if (context instanceof MutationRecord) {
    return getElementFromMutation(context, xpath, config)
  } else if (Array.isArray(context)) {
    for (const i of context) {
      const found = getElement(i, xpath, config)
      if (found) {
        return found
      }
    }
  }
}

/**
 * Convenience wrapper around `document.evaluate`.
 * Find the first HTMLElement by a given xpath
 */
const getElementFromNode = (context: Node, xpath: string): HTMLElement => {
  const node = document.evaluate(
    xpath,
    context,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue
  return node as HTMLElement
}

const getElementFromMutation = (
  mutation: MutationRecord,
  xpath: string,
  config: GetElemementFromMutationConfig = {}
) => {
  const placesToCheck = config.only ? [config.only] : ['addedNodes', 'removedNodes']
  for (const place of placesToCheck) {
    for (const el of mutation[place]) {
      if (getElementFromNode(el, xpath)) {
        return el
      }
    }
  }
}

/**
 * Find multiple HTMLElements by a given xpath.
 */
export const getElements = (parent: Node, xpath: string): HTMLElement[] => {
  const iterator = document.evaluate(
    xpath,
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
  xpath: string,
  { onlyNew = false, timeout = 3000 }: WaitForElementOptions = {}
): Promise<HTMLElement | null> => {
  return new Promise((resolve, reject) => {
    const target = getElementFromNode(parent, xpath)
    if (!onlyNew && target) {
      return resolve(target)
    }
    const observer = new MutationObserver((mutations, observer) => {
      const target = getElementFromNode(parent, xpath)
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
