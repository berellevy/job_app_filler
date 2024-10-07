import { TextField } from './TextField'
export const RegisterInputs = async (node: Node = document) => {
  
  Promise.all([
    TextField.autoDiscover(node)
  ])
}