import { getElement } from '@src/shared/utils/getElements'
import { AddressSearchable } from './AddressSearchable'
import { CheckboxBoolean } from './CheckboxBoolean'
import { CheckboxMulti } from './CheckboxMulti'
import { DropdownMultiSearchable } from './DropdownMultiSearchable'
import { DropdownSearchable } from './DropdownSearchable'
import { File } from './File'
import { NumberInput } from './NumberInput'
import { Section } from './Section'
import { Textarea } from './Textarea'
import { TextInput } from './TextInput'

/** Not present in job search page */
const applicationContainerElement = getElement(
  document,
  `.//div[@class="application--container"]`
)

const inputs = [
  TextInput,
  Textarea,
  File,
  DropdownMultiSearchable,
  DropdownSearchable,
  CheckboxMulti,
  CheckboxBoolean,
  NumberInput,
  AddressSearchable,
]

export const RegisterInputs = async (node: Node = document) => {
  if (applicationContainerElement) {
    await Section.autoDiscover(node)
    Promise.all(inputs.map((i) => i.autoDiscover(node)))
  }
}
