import { sleep } from './async'
import { Callback, miliseconds } from './types'

/**
 * Save original scroll position.
 * Execute callback (that might change scroll position).
 * Scroll back to original position.
 */
export const scrollBack = async (
  callback: Callback<void>,
  delay: miliseconds = 0
) => {
  const { scrollX, scrollY } = window
  const res = callback()
  if (res instanceof Promise) {
    await res
  }
  if (delay > 0) {
    await sleep(delay)
  }
  window.scrollTo(scrollX, scrollY)
}

export function isElementInView(
  element: HTMLElement,
  marginBottom: number = 0,
  marginTop: number = 0
): boolean {
  const rect = element.getBoundingClientRect()
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight
  const windowWidth = window.innerWidth || document.documentElement.clientWidth
  return (
    rect.top >= 0 + marginTop &&
    rect.left >= 0 &&
    rect.bottom + marginBottom <= windowHeight &&
    rect.right <= windowWidth
  )
}


export function waitForScrollIntoView(
  element: HTMLElement,
): Promise<void> {
  return new Promise<void>((resolve) => {
    if (isElementInView(element, 200)) {
      resolve()
    } else {
      const observer = new IntersectionObserver(
        async (entries, observer) => {
          entries.forEach(async (entry) => {
            if (entry.isIntersecting) {
              observer.disconnect()
              resolve()
            }
          })
        },
        { root: null, rootMargin: '100px', threshold: 1 }
      )
      observer.observe(element)
    }
  })
  
}
