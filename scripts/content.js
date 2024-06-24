function get_element(path) {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

FORM_TEXT_INPUT = `
  //div[starts-with(@data-automation-id, 'formField-')]
  [.//input[@type='text'] or .//input[@type='password']]
  [not(.//*[@aria-haspopup])]
`

const textFields = {}


const observer = new MutationObserver(mutations => {
  const el = document.evaluate(FORM_TEXT_INPUT, mutations[0].target, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
  let node = el.iterateNext()
  while (node) {
    if (!textFields.hasOwnProperty(node)) {
      textFields[node] = "hello"
      console.log("added", node);
    }
    node = el.iterateNext()
  }
  console.log(textFields);

});
observer.observe(document.body, {
  childList: true,
  subtree: true
});

