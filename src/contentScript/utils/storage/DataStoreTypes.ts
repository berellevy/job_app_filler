export type NewAnswer = {
  page?: string
  section: string
  fieldType: string
  fieldName: string
  answer: any
}
export type SavedAnswer = NewAnswer & {
  id: number
  matchType?: string
}