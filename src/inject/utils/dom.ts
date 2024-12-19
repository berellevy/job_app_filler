export function getShallowTextContent(element: HTMLElement, depth: number = 0): string {
  return Array.from(element.childNodes)
  .map((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent.trim()
    } else if (depth <= 0) {
      return ""
    }else if (node.nodeType === Node.ELEMENT_NODE) {
      return getShallowTextContent(node as HTMLElement, depth-1)
    }
    return ""
  })
  .join('');
}