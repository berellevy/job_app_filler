import { SingleFileUpload } from './SingleFileUpload'
import { TextField } from './TextField'
export const RegisterInputs = async (node: Node = document) => {
  Promise.all([
    TextField.autoDiscover(node),
    SingleFileUpload.autoDiscover(node),
  ])
}