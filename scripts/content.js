function get_element(path) {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}






const observer = new MutationObserver(mutations => {
  mutations.forEach( m => {
    const elements = get_elements(m.target, FORM_TEXT_INPUT)
    elements.forEach(registerInput)
    // console.dir(elements);

  })
});
observer.observe(document.body, {
  childList: true,
  subtree: true
});