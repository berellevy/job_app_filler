import { CardHeader, IconButton, CircularProgress, Box } from '@mui/material'
import { startCase } from 'lodash'
import React, { FC } from 'react'
import { RefreshIcon, CloseIcon } from '@src/shared/utils/icons'
import { useAppContext } from '../AppContext'

export const MoreInfoHeader: FC = () => {
  const {
    moreInfoPopper: {
      close,
      isRefreshing,
      handleRefreshButtonClick,
      fieldType,
    },
  } = useAppContext()

  const RefreshButton = (
    <IconButton onClick={handleRefreshButtonClick}>
      {isRefreshing ? <CircularProgress size={'1em'} /> : <RefreshIcon />}
    </IconButton>
  )

  const CloseButton = (
    <IconButton aria-label="close" onClick={close} sx={{ marginLeft: 'auto' }}>
      <CloseIcon />
    </IconButton>
  )

  return (
    <Box borderBottom="1px solid #e0e0e0">
      <CardHeader
        sx={{ padding: 1}}
        title={startCase(fieldType)}
        action={
          <>
            {RefreshButton}
            {CloseButton}
          </>
        }
      />
    </Box>
  )
}
