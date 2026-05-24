import { Dropdown } from "./Dropdown"
import { File } from "./File"
import { LinkedInUrl } from "./LinkedInUrl"
import { Phone } from "./Phone"
import { TextInput } from "./TextInput"

/**
 * Order matters: more specific adapters must claim their elements
 * before the generic TextInput sees them, because once a field is
 * registered (via the `job-app-filler` attribute) other adapters
 * skip it.
 *
 *   File       — owns `<input type="file">` wrappers
 *   Phone      — owns `<input type="tel">` wrappers
 *   LinkedInUrl — owns `<input type="url">` / linkedin-named inputs
 *   Dropdown   — owns native `<select>` wrappers
 *   TextInput  — fallback for any remaining `<input type="text">`
 */
const inputs = [File, Phone, LinkedInUrl, Dropdown, TextInput]

export const RegisterInputs = async (node: Node = document): Promise<void> => {
  await Promise.all(inputs.map((i) => i.autoDiscover(node)))
}
