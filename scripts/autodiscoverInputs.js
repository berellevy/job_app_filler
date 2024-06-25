FORM_TEXT_INPUT = `
  //div[starts-with(@data-automation-id, 'formField-')]
  [.//input[@type='text'] or .//input[@type='password']]
  [not(.//*[@aria-haspopup])]
`





function get_element(parent, path) {
  return document.evaluate(path, parent, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function get_elements(parent, path) {
  const iterator = document.evaluate(path, parent, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
  const result = []
  for (let i = 0; i < iterator.snapshotLength; i++) {
    result.push(iterator.snapshotItem(i))
  }
  return result


}


const registerInput = (node) => {
  if (!node.hasOwnProperty("jobAppFillerData")) {
    
    node.jobAppFillerData = {
      node: node,
      get name() {
        return get_element(this.node, "//label")
      }
    }
    console.dir(node);
  }
}