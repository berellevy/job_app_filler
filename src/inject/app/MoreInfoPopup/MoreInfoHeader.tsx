import { IconButton, CircularProgress, Box, Tooltip, Stack, Typography } from '@mui/material'
import { startCase } from 'lodash'
import React, { FC } from 'react'
import { RefreshIcon, CloseIcon } from '@src/shared/utils/icons'
import { useAppContext } from '../context/AppContext'
import ExpandableText from '../components/ExpandableText'

export const MoreInfoHeader: FC = () => {
  const {
    moreInfoPopper: {
      close,
      isRefreshing,
      handleRefreshButtonClick,
      fieldType,
    },
    backend
  } = useAppContext()

  const Title = (
    <Typography variant='h5'>
      <ExpandableText text={backend.fieldName} maxLength={50} />
    </Typography>
  )

  const SubHeader = (
    <Typography variant='subtitle2'>
      <Tooltip arrow title="Field Type">
        <span>
          {startCase(fieldType)}
        </span>
      </Tooltip>
      {backend.section && <>{" | "}<Tooltip arrow title="Section"><span>{backend.section}</span></Tooltip></>}
    </Typography>
  )

  const Text = (
    <Box pl={1} py={"auto"}>
      {Title}
      {SubHeader}
    </Box>
  )




  const RefreshButton = (
    <IconButton onClick={handleRefreshButtonClick}>
      {isRefreshing ? <CircularProgress size={'1em'} /> : <RefreshIcon />}
    </IconButton>
  )

  const CloseButton = (
    <IconButton aria-label="close" onClick={close} >
      <CloseIcon />
    </IconButton>
  )

  const Buttons = (
    <Stack alignItems={"flex-start"} direction={'row'}>

      {RefreshButton}
      {CloseButton}
    </Stack>
  )


  return (
    <Box borderBottom="1px solid #e0e0e0" p={1}>
      <Stack direction={"row"} justifyContent={'space-between'}>
        {Text}
        {Buttons}
      </Stack>
    </Box>
  )
}
