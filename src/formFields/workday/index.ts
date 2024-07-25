import { SimpleDropdown } from './simpleDropdown'
import { PasswordInput, TextInput } from './textInput'

export const RegisterInputs = async (node: Node = document) => {
  Promise.all([
    TextInput.autoDiscover(node),
    PasswordInput.autoDiscover(node),
    SimpleDropdown.autoDiscover(node),
  ])
}
