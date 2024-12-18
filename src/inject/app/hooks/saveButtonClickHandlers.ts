import { AppContextType } from '../context/types'

export interface SaveButtonClickHndler {
  (
    answer: any,
    context: Pick<
      AppContextType,
      'moreInfoPopper' | "answers"
    >
  ): void | Promise<void>
}

const basic: SaveButtonClickHndler = async (answer, {answers}) => {
  answers.add(answer)
}

const withNotice: SaveButtonClickHndler = async (
  newAnswer,
  { moreInfoPopper }
) => {
  moreInfoPopper.open()
}

export const saveButtonClickHandlers = {
  basic,
  withNotice,
}
