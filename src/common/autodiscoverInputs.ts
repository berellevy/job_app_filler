// const FORM_TEXT_INPUT = `
//   .//div[starts-with(@data-automation-id, 'formField-')]
//   [.//input[@type='text'] or .//input[@type='password']]
//   [not(.//*[@aria-haspopup])]
// `

// let idGenerator = (() => {
//   let value = 0
//   const idGenerator = () => {
//       value ++
//       return value
//   }
//   return idGenerator
// })()



// const get_answer = ({page, fieldName, type, }) => {
//   return {
//     "Email Address": "berellevy@gmail.com"
//   }[fieldName]
// }


// const getReactProps = (node: Node) => {
//   for (const key in node) {
//     if (key.startsWith("__reactProps")) {
//       return node[key]
//     }
//   }
// }

// // const fill = (nodeId) => {
// //   const el = document.querySelector(`div[job-app-filler-id='${nodeId}']`)
// //   console.dir(el);
// // }

// const registerInput = (node) => {
//   if (node.getAttribute("job-app-filler-id")) {return}
//   const nodeId = idGenerator()
//   const input = {
//     node: node,
//     type: "TextInput",
//     get answer() { return get_answer(this.path)},
//     get isFilled() { return this.currentValue === this.answer },
//     get reactProps() { return getReactProps(this.inputElement ) },
//     fill: function(nodeId) {
//       // el = document.querySelector(`div[job-app-filler-id='${nodeId}']`)
//       // console.log(el); 
//       console.log(this.reactProps)
//     },
//   }
  
//   node.setAttribute("job-app-filler-id", nodeId)
//   const button = document.createElement("button")
//   button.innerHTML = "Fill"
//   button.onclick = () => input.fill(nodeId)
//   node.appendChild(button)
// }