/**
 * given the regular dom element, get the props of the corresponding
 * react element. available as a property `__reactProps${random suffix}`
 * on the regular dom element
 */
export const getReactProps = (element: HTMLElement): any => {
  for (const key in element) {
    if (key.startsWith('__reactProps')) return element[key]
  }
}

type TextFillEvent = 'onChange' | 'onBlur'
type fillReactTextInputOptions = { eventName?: TextFillEvent }
const defaultOptions: fillReactTextInputOptions = {
  eventName: 'onChange',
}
export const fillReactTextInput = (
  input: HTMLInputElement,
  value: string,
  config: fillReactTextInputOptions = defaultOptions
): void => {
  const reactProps = getReactProps(input)
  input.value = value
  const eventData = {
    target: input,
    currentTarget: input,
    preventDefault: () => {},
  }
  reactProps?.[config.eventName](eventData)
}


/**
 * EventListener-like interface for characterData mutations.
 */
export const addCharacterMutationObserver = (
  element: Node,
  callback: () => any
): void => {
  const observer = new MutationObserver((mutations: MutationRecord[]) => {
    if (mutations.some((mutation) => mutation.type === 'characterData')) {
      callback()
    }
  })
  observer.observe(element, {
    characterData: true,
    childList: true,
    subtree: true,
  })
}
