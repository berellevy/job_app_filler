import { Dropdown } from "./Dropdown"
import { File } from "./File"
import { TextInput } from "./TextInput"

export const RegisterInputs = async (node: Node = document) => {
  const inputs = [
    TextInput,
    File,
    Dropdown,
  ]
  Promise.all(
    inputs.map(i => i.autoDiscover(node))
  )
}