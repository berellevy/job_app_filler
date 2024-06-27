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
  return document.evaluate(path, parent, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

const get_elements = (parent, path) => {
  const iterator = document.evaluate(path, parent, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
  const result = []
  for (let i = 0; i < iterator.snapshotLength; i++) {
    result.push(iterator.snapshotItem(i))
  }
  return result
}

const registerInput = (node) => {
  if (node.hasOwnProperty("jobAppFillerData")) {return}

  const input = {
    node: node,
    type: "TextInput",
    get page() { return get_element(document, ".//h2").innerText },
    get fieldName() { return get_element(node, ".//label").innerText },
    get path() { return { page: this.page, type: this.type, fieldName: this.fieldName, } },
    get inputElement() {return get_element(node, ".//input")},
    get currentValue() { return this.inputElement.value },
    get snapshot() { return { ...this.path, "answer": this.currentValue } },
    get answer() { return get_answer(this.path)},
    get isFilled() { return this.currentValue === this.answer },
    fill: function() {
      if (!this.isFilled) {
        const inputElement = this.inputElement
        // inputElement.value = this.answer
        const keyPressEvent = new KeyboardEvent('keypress', { key: key, bubbles: true, cancelable: true });
        inputElement.dispatchEvent(keyPressEvent);
        console.log("fill");
        // sendKeyPresses(inputElement, "hello")
      }
    },

  }
  node.jobAppFillerData = true
  const button = document.createElement("button")
  button.innerHTML = "Fill"
  button.onclick = () => input.fill()
  node.appendChild(button)


}