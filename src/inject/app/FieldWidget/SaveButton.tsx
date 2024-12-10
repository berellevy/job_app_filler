import React, { FC } from 'react'
import { Button, Tooltip } from '@mui/material'
import { SaveIcon } from '@src/shared/utils/icons'
import { useAppContext } from '../AppContext'
import { ButtonSuccessBadge } from '../components/ButtonSuccessBadge'

export const SaveButton: FC = () => {
  const {
    saveButton: { clickHandler, showSuccessBadge },
  } = useAppContext()
  return (
    <ButtonSuccessBadge show={showSuccessBadge}>
      <Tooltip title="Save current value as answer." placement="top" arrow>
        <Button onClick={() => clickHandler()}>
          <SaveIcon />
        </Button>
      </Tooltip>
    </ButtonSuccessBadge>
  )
}
