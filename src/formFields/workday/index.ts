import { BooleanRadio } from './BooleanRadio'
import { MonthYear, Year } from './Dates'
import { SearchableSingleDropdown } from './searchableSingleDropdown'
import { SimpleDropdown } from './simpleDropdown'
import { SingleCheckbox } from './SingleCheckbox'
import { TextArea } from './TextArea'
import { PasswordInput, TextInput } from './textInput'

export const RegisterInputs = async (node: Node = document) => {
  Promise.all([
    TextInput.autoDiscover(node),
    PasswordInput.autoDiscover(node),
    SimpleDropdown.autoDiscover(node),
    SearchableSingleDropdown.autoDiscover(node),
    SingleCheckbox.autoDiscover(node),
    MonthYear.autoDiscover(node),
    Year.autoDiscover(node),
    TextArea.autoDiscover(node),
    BooleanRadio.autoDiscover(node)
  ])
}
