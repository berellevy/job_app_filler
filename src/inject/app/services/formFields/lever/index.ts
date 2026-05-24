import { Dropdown } from './Dropdown'
import { File } from './File'
import { LinkedInUrl, OtherUrl } from './LinkedInUrl'
import { Phone } from './Phone'
import { EmailInput, NameInput, OrgInput } from './TextInput'

const inputs = [
  NameInput,
  EmailInput,
  Phone,
  OrgInput,
  LinkedInUrl,
  OtherUrl,
  File,
  Dropdown,
]

export const RegisterInputs = async (node: Node = document): Promise<void> => {
  await Promise.all(inputs.map((i) => i.autoDiscover(node)))
}
