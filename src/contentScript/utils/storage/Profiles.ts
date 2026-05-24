// A profile is metadata (id + name); each profile's answers live in its own
// DataStore namespaced by profile id. The legacy single store ("answers1010")
// is the "Default" profile, so existing users migrate with zero data movement.

import { DataStore } from './DataStore'

export const LEGACY_ANSWERS_KEY = 'answers1010'
const PROFILES_INDEX_KEY = 'profilesIndex'
const DEFAULT_PROFILE_NAME = 'Default'

export interface Profile {
  id: string
  name: string
}

export interface ProfilesIndex {
  profiles: Profile[]
  activeProfileId: string
}

/**
 * The legacy "Default" profile reuses the original storage key so a current
 * user's existing answers remain in place. All other profiles get a namespaced
 * key derived from their id.
 */
export const storeNameForProfile = (profileId: string): string => {
  return profileId === DEFAULT_PROFILE_ID
    ? LEGACY_ANSWERS_KEY
    : `${LEGACY_ANSWERS_KEY}:${profileId}`
}

export const DEFAULT_PROFILE_ID = 'default'

const defaultIndex = (): ProfilesIndex => ({
  profiles: [{ id: DEFAULT_PROFILE_ID, name: DEFAULT_PROFILE_NAME }],
  activeProfileId: DEFAULT_PROFILE_ID,
})

/**
 * Read the profiles index. If absent (existing single-profile user), seed a
 * "Default" profile pointing at the legacy answer store so nothing breaks.
 */
export const loadProfilesIndex = async (): Promise<ProfilesIndex> => {
  const result = await chrome.storage.local.get(PROFILES_INDEX_KEY)
  const stored = result[PROFILES_INDEX_KEY] as ProfilesIndex | undefined
  if (!stored || !Array.isArray(stored.profiles) || stored.profiles.length === 0) {
    const seeded = defaultIndex()
    await persistProfilesIndex(seeded)
    return seeded
  }
  return stored
}

const persistProfilesIndex = async (index: ProfilesIndex): Promise<void> => {
  await chrome.storage.local.set({ [PROFILES_INDEX_KEY]: index })
}

const generateProfileId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `profile-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/** Create a new empty profile. Returns the updated index (immutably). */
export const createProfile = async (name: string): Promise<ProfilesIndex> => {
  const index = await loadProfilesIndex()
  const profile: Profile = { id: generateProfileId(), name: name.trim() }
  const next: ProfilesIndex = {
    profiles: [...index.profiles, profile],
    activeProfileId: profile.id,
  }
  await persistProfilesIndex(next)
  return next
}

/** Rename a profile. Returns the updated index (immutably). */
export const renameProfile = async (
  profileId: string,
  name: string
): Promise<ProfilesIndex> => {
  const index = await loadProfilesIndex()
  const next: ProfilesIndex = {
    ...index,
    profiles: index.profiles.map((p) =>
      p.id === profileId ? { ...p, name: name.trim() } : p
    ),
  }
  await persistProfilesIndex(next)
  return next
}

/**
 * Delete a profile and its answer store. The Default profile cannot be deleted.
 * If the active profile is removed, the active id falls back to the first
 * remaining profile.
 */
export const deleteProfile = async (
  profileId: string
): Promise<ProfilesIndex> => {
  if (profileId === DEFAULT_PROFILE_ID) {
    throw new Error('The Default profile cannot be deleted.')
  }
  const index = await loadProfilesIndex()
  const remaining = index.profiles.filter((p) => p.id !== profileId)
  const activeProfileId =
    index.activeProfileId === profileId
      ? remaining[0]?.id ?? DEFAULT_PROFILE_ID
      : index.activeProfileId
  const next: ProfilesIndex = { profiles: remaining, activeProfileId }
  await persistProfilesIndex(next)
  await chrome.storage.local.remove(storeNameForProfile(profileId))
  return next
}

/** Set the active profile. Returns the updated index (immutably). */
export const setActiveProfile = async (
  profileId: string
): Promise<ProfilesIndex> => {
  const index = await loadProfilesIndex()
  if (!index.profiles.some((p) => p.id === profileId)) {
    throw new Error(`Unknown profile: ${profileId}`)
  }
  const next: ProfilesIndex = { ...index, activeProfileId: profileId }
  await persistProfilesIndex(next)
  return next
}

/** Build a loaded DataStore for the given profile's answers. */
export const loadProfileStore = async (
  profileId: string
): Promise<DataStore> => {
  const store = new DataStore(storeNameForProfile(profileId))
  await store.load()
  return store
}
