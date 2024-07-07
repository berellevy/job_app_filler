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
