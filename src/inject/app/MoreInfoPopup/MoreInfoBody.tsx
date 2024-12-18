import { Box, Stack } from '@mui/material'
import React, { FC } from 'react'
import { useAppContext } from '../context/AppContext'
import { Answers } from './Answers'
import { Item, FieldNotice } from './components'
import { teal } from '@mui/material/colors'


const MoreInfoBody: FC = () => {
  const { fieldNotice } = useAppContext()
  return (
    <Box
      padding={1}
      sx={{
        maxHeight: 380,
        overflow: 'scroll',
      }}
      bgcolor={teal[100]}
    >
      <Stack spacing={2} >
        {fieldNotice && (

          <FieldNotice>{fieldNotice}</FieldNotice>

        )}
        <Answers />
      </Stack>
    </Box>
  )
}

export default MoreInfoBody