

const observer = new MutationObserver((_) => {
  const elements = get_elements(document, FORM_TEXT_INPUT)
  elements.forEach(registerInput)
});
observer.observe(document.body, {
  childList: true,
  subtree: true
});