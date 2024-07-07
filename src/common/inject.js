import { randomVar } from "./test";
console.log(randomVar)

const observer = new MutationObserver((_) => {
  const elements = getElements(document, FORM_TEXT_INPUT)
  elements.forEach(registerInput)
});
observer.observe(document.body, {
  childList: true,
  subtree: true
});