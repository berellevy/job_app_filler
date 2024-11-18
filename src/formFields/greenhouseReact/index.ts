import { getElement } from "../../utils/getElements";
import { CheckboxBoolean } from "./CheckboxBoolean";
import { CheckboxMulti } from "./CheckboxMulti";
import { Dropdown } from "./Dropdown"
import { DropdownMultiSearchable } from "./DropdownMultiSearchable";
import { DropdownSearchable } from "./DropdownSearchable";
import { File } from "./File"
import { Textarea } from "./Textarea";
import { TextInput } from "./TextInput"

/** Not present in job search page */
const applicationContainerElement = getElement(
  document,
  `.//div[@class="application--container"]`
)

const inputs = [
  TextInput,
  Textarea,
  File,
  // Dropdown,
  DropdownMultiSearchable,
  DropdownSearchable,
  CheckboxMulti,
  CheckboxBoolean,
]

export const RegisterInputs = async (node: Node = document) => {
  if (applicationContainerElement) {
    Promise.all(
      inputs.map(i => i.autoDiscover(node))
    )
  }  
}