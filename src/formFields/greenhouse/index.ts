
import { AddressSearchField } from './AddressSearchField'
import { SimpleDropdown } from './SimpleDropdown'
import { SingleFileUpload } from './SingleFileUpload'
import { TextField } from './TextField'
export const RegisterInputs = async (node: Node = document) => {
  Promise.all([
    TextField.autoDiscover(node),
    SingleFileUpload.autoDiscover(node),
    AddressSearchField.autoDiscover(node),
    SimpleDropdown.autoDiscover(node),
  ])
}