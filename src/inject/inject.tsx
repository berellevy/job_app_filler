import { RegisterTextInputs } from "../workday/textInput";




const observer = new MutationObserver((_) => {
    RegisterTextInputs(document)
})
observer.observe(document.body, {
  childList: true,
  subtree: true,
})
