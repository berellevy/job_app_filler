import { getElement } from '../../utils/getElements'
import { BooleanRadio } from './BooleanRadio'
import { MonthYear, MonthDayYear, Year } from './Dates'
import { MultiCheckbox } from './MultiCheckbox'
import { MultiFileUpload } from './MultiFileUpload'
import { PasswordInput } from './PasswordInput'
import { SearchableSingleDropdown } from './searchableSingleDropdown'
import { SimpleDropdown } from './simpleDropdown'
import { SingleCheckbox } from './SingleCheckbox'
import { TextArea } from './TextArea'
import { TextInput } from './textInput'

export const RegisterInputs = async (node: Node = document) => {
  const searchPageXpath = ".//div[@data-automation-id='jobSearch']"
  if (getElement(document, searchPageXpath)) {
    return
  }

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
    MultiCheckbox.autoDiscover(node),
    MultiFileUpload.autoDiscover(node),
  ])
}
