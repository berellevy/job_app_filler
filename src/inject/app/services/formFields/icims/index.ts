import { Dropdown } from './Dropdown'
import { File } from './File'
import { LinkedInUrl } from './LinkedInUrl'
import { Phone } from './Phone'
import { EmailInput, FirstNameInput, LastNameInput } from './TextInput'

const inputs = [
  FirstNameInput,
  LastNameInput,
  EmailInput,
  Phone,
  LinkedInUrl,
  File,
  Dropdown,
]

export const RegisterInputs = async (node: Node = document): Promise<void> => {
  await Promise.all(inputs.map((i) => i.autoDiscover(node)))
}
