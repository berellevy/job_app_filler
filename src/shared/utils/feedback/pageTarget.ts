export interface FeedbackTargetRect {
  x: number
  y: number
  w: number
  h: number
}

export interface FeedbackTarget {
  selector: string
  text: string
  rect: FeedbackTargetRect
}

const MAX_SELECTOR_PARTS = 6
const MAX_CLASS_PARTS = 2

export function buildStableCssPath(el: Element): string {
  const parts: string[] = []
  let current: Element | null = el

  while (current && current.nodeType === Node.ELEMENT_NODE && parts.length < MAX_SELECTOR_PARTS) {
    let part = current.nodeName.toLowerCase()

    if (current.id) {
      part += `#${cssEscape(current.id)}`
      parts.unshift(part)
      break
    }

    const className = Array.from(current.classList)
      .slice(0, MAX_CLASS_PARTS)
      .map(cssEscape)
      .join('.')
    if (className) {
      part += `.${className}`
    }

    const parent = current.parentElement
    if (parent) {
      const sameTagSiblings = Array.from(parent.children).filter(
        (child) => child.nodeName === current?.nodeName
      )
      if (sameTagSiblings.length > 1) {
        part += `:nth-of-type(${sameTagSiblings.indexOf(current) + 1})`
      }
    }

    parts.unshift(part)
    current = parent
  }

  return parts.join(' > ')
}

export function buildFeedbackTarget(el: Element): FeedbackTarget {
  const rect = el.getBoundingClientRect()
  return {
    selector: buildStableCssPath(el),
    text: (textFromElement(el) || '').slice(0, 200),
    rect: {
      x: rect.left,
      y: rect.top,
      w: rect.width,
      h: rect.height,
    },
  }
}

function textFromElement(el: Element): string {
  const maybeText = el instanceof HTMLElement ? el.innerText : el.textContent
  return (maybeText || el.textContent || '').trim()
}

function cssEscape(value: string): string {
  const css = globalThis.CSS
  if (css?.escape) {
    return css.escape(value)
  }
  return value.replace(/[^a-zA-Z0-9_-]/g, '\\$&')
}
