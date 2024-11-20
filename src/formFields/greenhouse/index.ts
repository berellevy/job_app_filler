
import { Sections } from './Sections'
import { AddressSearchField } from './AddressSearchField'
import { BasicSelect } from './BasicSelect'
import { MultiCheckbox } from './MultiCheckBox'
import { SimpleDropdown } from './SimpleDropdown'
import { SingleFileUpload } from './SingleFileUpload'
import { Textarea } from './Textarea'
import { TextField } from './TextField'
import { MonthYear } from './MonthYear'

const inputs = [
  TextField,
  SingleFileUpload,
  AddressSearchField,
  SimpleDropdown,
  Textarea,
  BasicSelect,
  MultiCheckbox,
  MonthYear,
]

export const RegisterInputs = async (node: Node = document) => {
  await Sections.autoDiscover(node)
  Promise.all(inputs.map((i) => i.autoDiscover(node)))
}