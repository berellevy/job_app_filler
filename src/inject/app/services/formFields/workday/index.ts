import { getElement } from '@src/shared/utils/getElements'
import { BooleanCheckbox } from './BooleanCheckbox'
import { BooleanRadio } from './BooleanRadio'
import { CheckboxesSingle } from './CheckboxesSingle'
import { MonthYear, MonthDayYear, Year } from './Dates'
import { Dropdown } from './Dropdown'
import { DropdownSearchable } from './DropdownSearchable'
import { FileMulti } from './FileMulti'
import { Password } from './Password'
import { TextArea } from './TextArea'
import { TextInput } from './TextInput'

const inputs = [
  TextInput,
  Password,
  Dropdown,
  DropdownSearchable,
  BooleanCheckbox,
  MonthYear,
  Year,
  MonthDayYear,
  TextArea,
  BooleanRadio,
  CheckboxesSingle,
  FileMulti,
]

export const RegisterInputs = async (node: Node = document) => {
  const searchPageXpath = ".//div[@data-automation-id='jobSearch']"
  if (getElement(document, searchPageXpath)) {
    return
  }
  Promise.all(inputs.map((i) => i.autoDiscover(node)))
}
