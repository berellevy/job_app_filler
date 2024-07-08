export const uid = (() => {
  let counter = 0
  const increment = () => {
    counter++
    return 'jaf-' + counter
  }
  return increment
})()
