
import { Sections } from './Sections'
import { Textarea } from './Textarea'
import { MonthYear } from './MonthYear'
import { DropdownSearchable } from './DropdownSearchable'
import { DropdownMulti } from './DropdownMulti'
import { TextInput } from './TextInput'
import { File } from './File'
import { Dropdown } from './Dropdown'
import { Checkboxes } from './Checkboxes'
import { Select } from './Select'
import { AddressSearchable } from './AddressSearchable'

const inputs = [
  TextInput,
  File,
  AddressSearchable,
  Dropdown,
  Textarea,
  Select,
  Checkboxes,
  MonthYear,
  DropdownSearchable,
  DropdownMulti,
]

export const RegisterInputs = async (node: Node = document) => {
  await Sections.autoDiscover(node)
  Promise.all(inputs.map((i) => i.autoDiscover(node)))
}