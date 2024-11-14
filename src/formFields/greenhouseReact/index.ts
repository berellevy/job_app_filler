import { getElement } from "../../utils/getElements";
import { Dropdown } from "./Dropdown"
import { File } from "./File"
import { TextInput } from "./TextInput"
/** Not present in job search page */

const applicationContainerElement = getElement(
  document,
  `.//div[@class="application--container"]`
)

export const RegisterInputs = async (node: Node = document) => {
  if (applicationContainerElement) {
    const inputs = [
      TextInput,
      File,
      Dropdown,
    ]
    Promise.all(
      inputs.map(i => i.autoDiscover(node))
    )
  }  
}