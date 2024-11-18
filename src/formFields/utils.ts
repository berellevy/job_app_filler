
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



export const fillReactTextInput = (input: HTMLInputElement, value: string ): void => {
  const reactProps = getReactProps(input)
  input.value = value
  const eventData = {
    target: input,
    currentTarget: input,
    preventDefault: () => {}
  }
  reactProps?.onChange(eventData)
}