import { IconButton, CircularProgress, Box, Tooltip, Stack, Typography, Paper } from '@mui/material'
import { startCase } from 'lodash'
import React, { FC } from 'react'
import { RefreshIcon, CloseIcon } from '@src/shared/utils/icons'
import { useAppContext } from '../context/AppContext'
import { ExpandableText } from '../components/ExpandableText'
import { teal } from '@mui/material/colors'



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
      <ExpandableText text={backend.fieldName} maxLines={1} />
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
      {backend.currentValue && <>{" | "}<Tooltip arrow title="Current"><span>{backend.currentValue()}</span></Tooltip></>}
    </Typography>
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


  return (
    <Box borderBottom="1px solid #e0e0e0"  p={.5} bgcolor={teal[100]}>
      <Paper  elevation={2} sx={{p: 1, bgcolor: teal[50]}}>

      <Stack direction={"row"} justifyContent={'space-between'}>
        <Box pl={1} py={"auto"}>
          {Title}
          {SubHeader}
        </Box>
        <Stack alignItems={"flex-start"} direction={'row'}>
          {RefreshButton}
          {CloseButton}
        </Stack>
      </Stack>
      </Paper>
    </Box>
  )
}
