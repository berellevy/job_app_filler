import { BooleanRadio } from './BooleanRadio'
import { MonthYear, MonthDayYear, Year } from './Dates'
import { MultiCheckbox } from './MultiCheckbox'
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
    MonthDayYear.autoDiscover(node),
    TextArea.autoDiscover(node),
    BooleanRadio.autoDiscover(node),
    MultiCheckbox.autoDiscover(node)
  ])
}
