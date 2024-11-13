import { File } from "./File"
import { TextInput } from "./TextInput"

export const RegisterInputs = async (node: Node = document) => {
  Promise.all([
    TextInput.autoDiscover(node),
    File.autoDiscover(node)
  ])
}