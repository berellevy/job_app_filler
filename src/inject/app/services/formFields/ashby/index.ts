import { getElement } from '@src/shared/utils/getElements'
import { Dropdown } from './Dropdown'
import { File } from './File'
import { LinkedInUrl } from './LinkedInUrl'
import { Phone } from './Phone'
import { TextInput } from './TextInput'

/**
 * We deliberately list the more specific field types BEFORE the generic
 * `TextInput`. Each XPath excludes fields owned by another type (phone,
 * linkedin, file, select) so each wrapper is registered by exactly one
 * class.
 */
type FieldClass = {
  XPATH: string
  autoDiscover: (node: Node) => Promise<void>
}

const inputs: FieldClass[] = [
  LinkedInUrl,
  Phone,
  File,
  Dropdown,
  TextInput,
]

/**
 * Only run autodiscover when we're actually on an Ashby application page —
 * i.e. there is a `<form>` somewhere on the page. This keeps us from
 * registering on the job-listing page itself.
 *
 * The check runs on EVERY call (not once at module load): Ashby is a SPA
 * that mounts the form asynchronously, and `inject.ts` re-invokes
 * `RegisterInputs` on each DOM mutation, so the form may not exist on the
 * first call but appear on a later one.
 */
export const RegisterInputs = async (node: Node = document): Promise<void> => {
  const applicationFormElement = getElement(document, `.//form`)
  if (!applicationFormElement) {
    return
  }
  await Promise.all(inputs.map((i) => i.autoDiscover(node)))
}
