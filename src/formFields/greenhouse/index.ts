
import { AddressSearchField } from './AddressSearchField'
import { BasicSelect } from './BasicSelect'
import { SimpleDropdown } from './SimpleDropdown'
import { SingleFileUpload } from './SingleFileUpload'
import { Textarea } from './Textarea'
import { TextField } from './TextField'
export const RegisterInputs = async (node: Node = document) => {
  Promise.all([
    TextField.autoDiscover(node),
    SingleFileUpload.autoDiscover(node),
    AddressSearchField.autoDiscover(node),
    SimpleDropdown.autoDiscover(node),
    Textarea.autoDiscover(node),
    BasicSelect.autoDiscover(node),
  ])
}