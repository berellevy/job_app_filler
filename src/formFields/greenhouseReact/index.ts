import { getElement } from "../../utils/getElements";
import { Dropdown } from "./Dropdown"
import { DropdownMulti } from "./DropdownMulti";
import { File } from "./File"
import { Textarea } from "./Textarea";
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
      Textarea,
      File,
      Dropdown,
      DropdownMulti,
    ]
    Promise.all(
      inputs.map(i => i.autoDiscover(node))
    )
  }  
}