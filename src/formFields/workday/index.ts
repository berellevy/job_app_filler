import { SearchableSingleDropdown } from './searchableSingleDropdown'
import { SimpleDropdown } from './simpleDropdown'
import { SingleCheckbox } from './SingleCheckbox'
import { PasswordInput, TextInput } from './textInput'

export const RegisterInputs = async (node: Node = document) => {
  Promise.all([
    TextInput.autoDiscover(node),
    PasswordInput.autoDiscover(node),
    SimpleDropdown.autoDiscover(node),
    SearchableSingleDropdown.autoDiscover(node),
    SingleCheckbox.autoDiscover(node)
  ])
}
