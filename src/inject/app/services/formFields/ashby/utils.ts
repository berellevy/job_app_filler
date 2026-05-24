/**
 * Ashby-specific helpers.
 *
 * Ashby is heavily React-controlled — setting `.value` directly is
 * silently overwritten on the next render. To make React notice the
 * change, we use the native value setter from the prototype (which
 * bypasses React's instrumented setter) and then dispatch the events
 * React listens for (`input` + `change`).
 *
 * See: https://github.com/facebook/react/issues/10135
 */

/**
 * Set the value of a React-controlled `<input>` or `<textarea>` and
 * fire the events React expects so its state is kept in sync.
 */
export const setNativeValue = (
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string
): void => {
  const proto = Object.getPrototypeOf(element) as object
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(proto, 'value')
    ?.set

  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value)
  } else if (valueSetter) {
    valueSetter.call(element, value)
  } else {
    element.value = value
  }

  element.dispatchEvent(new Event('input', { bubbles: true }))
  element.dispatchEvent(new Event('change', { bubbles: true }))
}

/**
 * Set the value of a native `<select>` and dispatch the change event.
 */
export const setNativeSelectValue = (
  element: HTMLSelectElement,
  value: string
): void => {
  const proto = Object.getPrototypeOf(element) as object
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(proto, 'value')
    ?.set

  if (prototypeValueSetter) {
    prototypeValueSetter.call(element, value)
  } else {
    element.value = value
  }

  element.dispatchEvent(new Event('input', { bubbles: true }))
  element.dispatchEvent(new Event('change', { bubbles: true }))
}

/**
 * Dispatch a full mousedown -> mouseup -> click sequence on an element.
 *
 * react-select (which Ashby uses for its searchable dropdowns / location
 * combobox) commits an option selection on `mousedown`, not `click`, so a
 * bare `element.click()` is unreliable. Firing all three events mirrors a
 * real pointer interaction and works across react-select versions.
 */
export const dispatchMouseSequence = (element: HTMLElement): void => {
  const init: MouseEventInit = { bubbles: true, cancelable: true, view: window }
  element.dispatchEvent(new MouseEvent('mousedown', init))
  element.dispatchEvent(new MouseEvent('mouseup', init))
  element.dispatchEvent(new MouseEvent('click', init))
}

/**
 * Trigger React's onChange for a file `<input>` by reassigning its
 * `files` via the native setter, then dispatching `change`.
 */
export const setNativeFiles = (
  element: HTMLInputElement,
  files: File[]
): void => {
  const dataTransfer = new DataTransfer()
  files.forEach((f) => dataTransfer.items.add(f))

  const proto = Object.getPrototypeOf(element) as object
  const prototypeFilesSetter = Object.getOwnPropertyDescriptor(proto, 'files')
    ?.set

  if (prototypeFilesSetter) {
    prototypeFilesSetter.call(element, dataTransfer.files)
  } else {
    // Fallback: assign directly. Some browsers reject this, but it's the
    // best we can do if the prototype descriptor isn't writable.
    Object.defineProperty(element, 'files', {
      value: dataTransfer.files,
      configurable: true,
    })
  }

  element.dispatchEvent(new Event('change', { bubbles: true }))
}
