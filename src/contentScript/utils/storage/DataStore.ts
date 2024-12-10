import elasticlunr from 'elasticlunr'
import { NewAnswer, SavedAnswer } from './DataStoreTypes'
import { Answer, FieldPath } from '@src/shared/utils/types'

export const convert106To1010 = (
  answer106: Answer
): NewAnswer | SavedAnswer => {
  const answer1010 = { answer: answer106.answer, ...answer106.path }
  const { matchType, id } = answer106
  if (id !== undefined) {
    ;(answer1010 as SavedAnswer).id = id
  }
  if (matchType !== undefined) {
    ;(answer1010 as SavedAnswer).matchType = matchType
  }
  return answer1010
}

export const convert1010To106 = (
  answer1010: NewAnswer | SavedAnswer
): Answer => {
  const { section, fieldType, fieldName, answer, id, matchType } =
    answer1010 as SavedAnswer
  return { answer, id, matchType, path: { section, fieldName, fieldType } }
}

const tsIndex = () => {
  const index = elasticlunr<{ fieldName: string; id: number }>()
    .addField('fieldName')
    .addField('id')
  return index
}

class ExactMatchIndex {
  store: { [key: string]: number[] }
  constructor() {
    this.store = {}
  }
  add(key: string, id: number) {
    const ids = this.store[key] || []
    if (!ids.includes(id)) {
      ids.push(id)
    }
    this.store[key] = ids
  }

  delete(key: string, id: number) {
    let ids = this.store[key] || []
    ids = ids.filter((i) => i !== id)
    if (ids.length === 0) {
      delete this.store[key]
    }
  }

  get(key: string): number[] {
    return this.store[key] || []
  }
}

export class DataStore {
  store: Map<number, SavedAnswer>
  autoIncrement: number
  name: string
  loaded: boolean
  exactMatchIndex: ExactMatchIndex
  ts_index: elasticlunr.Index<{
    fieldName: string
    id: number
  }>

  constructor(name: string) {
    this.name = name
    this.store = new Map()
    this.autoIncrement = 0 // Auto-incrementing ID counter
    this.exactMatchIndex = new ExactMatchIndex()
    this.ts_index = tsIndex()

    this.loaded = false
  }
  // BUT WHAT ABOUT DATE VALUES AND ARRAY VALUES.
  findExisting(newAnswer: NewAnswer): SavedAnswer | null {
    return this.exactSearch(newAnswer.fieldName).find((savedAnswer) => {
      return Object.entries(newAnswer).every(([key, value]) => {
        return JSON.stringify(savedAnswer[key]) === JSON.stringify(value)
      })
    })
  }

  // Method to add a new item, auto-generating an ID
  add(item: NewAnswer, id: number = null): SavedAnswer {
    if (!this.loaded) {
      throw new Error('load it first')
    }
    id = id || this.autoIncrement++ // Increment the ID
    const existingMatch = this.findExisting(item)
    if (existingMatch) {
      return existingMatch
    }
    const savedAnswer = { ...item, id }
    this.store.set(id, savedAnswer) // Store the item with the new ID
    this.exactMatchIndex.add(item.fieldName, id)
    this.ts_index.addDoc({ fieldName: item.fieldName, id })
    this.persist() // Persist the data to chrome.storage.local
    return savedAnswer // Return the assigned ID
  }

  // Method to retrieve an item by ID
  get(id: number): SavedAnswer {
    return this.store.get(id)
  }

  // Method to remove an item by ID
  delete(id: number) {
    if (!this.loaded) {
      throw new Error('load it first')
    }
    const record = this.store.get(id)
    if (record) {
      this.exactMatchIndex.delete(record.fieldName, id)
      this.ts_index.removeDoc({ fieldName: record.fieldName, id })
      this.store.delete(id)
      this.persist()
      return true
    }
    return false
  }

  update(item: SavedAnswer): SavedAnswer {
    if (!this.loaded) {
      throw new Error('load it first')
    }
    const old = this.get(item.id)
    if (old) {
      this.delete(old.id)
    }
    this.add(item, item.id)
    return item
  }

  // Method to retrieve all items
  getAll() {
    return Array.from(this.store.values())
  }

  // Persist the store and current ID to chrome.storage.local
  async persist() {
    if (!this.loaded) {
      throw new Error('load it first')
    }
    const data = {
      store: Array.from(this.store.entries()), // Convert Map to array for storage
      autoIncrement: this.autoIncrement,
    }
    chrome.storage.local.set({ [this.name]: data })
  }

  // Load the store and current ID from chrome.storage.local
  async load() {
    const result = await chrome.storage.local.get(this.name)
    if (result[this.name]) {
      const { store, autoIncrement } = result[this.name]
      this.store = new Map(store) // Convert array back to Map
      this.autoIncrement = autoIncrement // Restore the current ID
      store.forEach(([id, { fieldName }]) => {
        this.exactMatchIndex.add(fieldName, id)
        this.ts_index.addDoc({ fieldName, id })
      })
    }
    this.loaded = true
  }

  exactSearch(fieldName: string): SavedAnswer[] {
    const matchingIds = this.exactMatchIndex.get(fieldName)
    return matchingIds.map((id: number) => {
      return { ...this.get(id), matchType: 'exact' }
    })
  }

  tsSearch(fieldName: string): SavedAnswer[] {
    const results = this.ts_index.search(fieldName, {})
    return results.map(({ ref, score }) => {
      return { ...this.get(parseInt(ref)), matchType: `Similar: ${score}` }
    })
  }

  pushResults(results: SavedAnswer[], matches: SavedAnswer[]) {
    const currentIds = results.map(({ id }) => id)
    matches.forEach((match) => {
      if (!currentIds.includes(match.id)) {
        results.push(match)
      }
    })
  }

  search({ fieldName, section, fieldType }: FieldPath): SavedAnswer[] {
    const limit = 10
    // get matches
    const exactMatches = this.exactSearch(fieldName)
    const tsMatches = this.tsSearch(fieldName)
    // combine matches
    const results = []
    this.pushResults(results, exactMatches)
    this.pushResults(results, tsMatches)
    // filter matches
    const filteredResults = results.filter((answer: SavedAnswer) => {
      return answer.fieldType === fieldType && answer.section === section
    })
    return filteredResults.slice(0, limit)
  }
}
