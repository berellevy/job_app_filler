import { getElement } from '../../../../../shared/utils/getElements'
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

const inputs = [
  TextInput,
  PasswordInput,
  SimpleDropdown,
  SearchableSingleDropdown,
  SingleCheckbox,
  MonthYear,
  Year,
  MonthDayYear,
  TextArea,
  BooleanRadio,
  MultiCheckbox,
  MultiFileUpload,
]


export const RegisterInputs = async (node: Node = document) => {
  const searchPageXpath = ".//div[@data-automation-id='jobSearch']"
  if (getElement(document, searchPageXpath)) {
    return
  }
  Promise.all(inputs.map((i) => i.autoDiscover(node)))
}
