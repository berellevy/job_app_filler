// Adapted from aerhedai/job-autofiller-ai (Apache-2.0). https://github.com/aerhedai/job-autofiller-ai
//
// The source selects the active profile in the popup and passes its fields to the
// content script at fill time. Our content script instead resolves answers through
// a singleton DataStore. To support multiple profiles we make that singleton an
// "active answers" facade that delegates to the DataStore of whichever profile is
// active, re-pointing itself when the user switches profiles in the popup.

import { DataStore } from './DataStore'
import { parseKey } from './utils'
import { NewAnswer, SavedAnswer } from './DataStoreTypes'
import { FieldPath } from '@src/shared/utils/types'
import {
  LEGACY_ANSWERS_KEY,
  loadProfileStore,
  loadProfilesIndex,
} from './Profiles'

/**
 * One-time migration of the original `answers106` store into the legacy
 * `answers1010` key (which is the Default profile's store). Unchanged in
 * behaviour from the single-profile version.
 */
export const migrate1010 = async () => {
  const localStorageAll = await chrome.storage.local.get()
  if (!('answers106' in localStorageAll)) {
    return
  }
  if (LEGACY_ANSWERS_KEY in localStorageAll) {
    return
  }
  const store = new DataStore(LEGACY_ANSWERS_KEY)
  await store.load()
  Object.entries(localStorageAll['answers106']).forEach(([path, answer]) => {
    store.add({
      answer: answer,
      ...parseKey(path),
    })
  })
}

/**
 * Facade over the active profile's DataStore. Existing call sites use a single
 * `answers1010` object, so this preserves that surface while routing every
 * operation to the currently-active profile. The active profile id is read from
 * storage on `load()` and lazily re-checked so a profile switch in the popup is
 * picked up on the next fill without reloading the page.
 */
class ActiveAnswers {
  private store: DataStore | null
  private activeProfileId: string | null

  constructor() {
    this.store = null
    this.activeProfileId = null
  }

  /** Resolve (and load) the DataStore for the currently-active profile. */
  private async resolveStore(): Promise<DataStore> {
    const { activeProfileId } = await loadProfilesIndex()
    if (!this.store || this.activeProfileId !== activeProfileId) {
      this.store = await loadProfileStore(activeProfileId)
      this.activeProfileId = activeProfileId
    }
    return this.store
  }

  async load(): Promise<void> {
    await this.resolveStore()
  }

  async add(item: NewAnswer, id: number = null): Promise<SavedAnswer> {
    const store = await this.resolveStore()
    return store.add(item, id)
  }

  async update(item: SavedAnswer): Promise<SavedAnswer> {
    const store = await this.resolveStore()
    return store.update(item)
  }

  async search(fieldPath: FieldPath): Promise<SavedAnswer[]> {
    const store = await this.resolveStore()
    return store.search(fieldPath)
  }

  async delete(id: number): Promise<boolean> {
    const store = await this.resolveStore()
    return store.delete(id)
  }
}

export const answers1010 = new ActiveAnswers()
