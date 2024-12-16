import { Box, Stack, Typography } from '@mui/material'
import React, { FC } from 'react'
import { useAppContext } from '../context/AppContext'
import { Answers } from './Answers'
import { Item, FieldNotice } from './components'


const MoreInfoBody: FC = () => {
    const { currentValue, fieldNotice } = useAppContext()
    return (
        <Box
          padding={1}
          sx={{
            maxHeight: 380,
            overflow: 'scroll',
            
          }}
        >
          <Stack spacing={2}>
            {fieldNotice && (
              <Item>
                <FieldNotice>{fieldNotice}</FieldNotice>
              </Item>
            )}
            <Item>
              <Answers />
            </Item>
            <Item>
              <Typography variant="h6">Current Value</Typography>
              <Typography>{String(currentValue)}</Typography>
            </Item>
          </Stack>
        </Box>
    )
}

export default MoreInfoBody