import React, { FC } from 'react'
import { ButtonGroup, Paper } from '@mui/material'
import { useAppContext } from '../AppContext'
import { FillButton } from './FillButton'
import { SaveButton } from './SaveButton'
import { MoreInfoButton } from './MoreInfoButton'

export const FieldWidgetButtons: FC = () => {
  const { moreInfoPopper } = useAppContext()
  return (
    <Paper elevation={4}>
      <ButtonGroup ref={moreInfoPopper.anchorRef} size="small">
        <FillButton />
        <SaveButton />
        <MoreInfoButton />
      </ButtonGroup>
    </Paper>
  )
}
