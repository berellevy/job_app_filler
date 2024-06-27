FORM_TEXT_INPUT = `
  .//div[starts-with(@data-automation-id, 'formField-')]
  [.//input[@type='text'] or .//input[@type='password']]
  [not(.//*[@aria-haspopup])]
`



const get_answer = ({page, fieldName, type, }) => {
  return {
    "Email Address": "berellevy@gmail.com"
  }[fieldName]
}



const get_element = (parent, path) => {
  const node = document.evaluate(path, parent, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  return node
}

const get_elements = (parent, path) => {
  const iterator = document.evaluate(path, parent, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
  const result = []
  for (let i = 0; i < iterator.snapshotLength; i++) {
    result.push(iterator.snapshotItem(i))
  }
  return result
}


const getReactProps = (node) => {
  for (key in node) {
    if (key.startsWith("__reactProps")) {
      return node[key]
    }
  }
}



const registerInput = (node) => {
  if (node.hasOwnProperty("jobAppFillerData")) {return}
  // if (!getReactProps(node)) {return}
  const input = {
    node: node,
    type: "TextInput",
    get page() { return get_element(document, ".//h2").innerText },
    get fieldName() { return get_element(this.node, ".//label").innerText },
    get path() { return { page: this.page, type: this.type, fieldName: this.fieldName, } },
    get inputElement() {return get_element(this.node, ".//input")},
    get currentValue() { return this.inputElement.value },
    get snapshot() { return { ...this.path, "answer": this.currentValue } },
    get answer() { return get_answer(this.path)},
    get isFilled() { return this.currentValue === this.answer },
    get reactProps() { return getReactProps(this.inputElement ) },
    fill: function() {
      console.dir(this.node);
      if (!this.isFilled) {
        
      }
    },

  }
  node.jobAppFillerData = true
  const button = document.createElement("button")
  button.innerHTML = "Fill"
  button.onclick = () => input.fill()
  node.appendChild(button)
}