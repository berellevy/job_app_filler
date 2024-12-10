import {
  Avatar,
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  Chip,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { FC } from 'react'

import { useAppContext } from '../AppContext'
import { MoreInfoHeader } from './MoreInfoHeader'
import { FieldNotice, Item } from './components'
import { AnswersSection } from './AnswerSection'
import { FieldInfo } from './FieldInfo'

const MoreInfoCardContainer: FC = () => {
  const { currentValue, fieldNotice } = useAppContext()

  return (
    <Card>
      <MoreInfoHeader />
      <CardContent sx={{ padding: 0, paddingBottom: '0px!important' }}>
        <Box
          padding={1}
          sx={{
            maxWidth: 'calc(45vw)',
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
              <AnswersSection />
            </Item>
            <Item>
              <Typography variant="h6">Current Value</Typography>
              <Typography>{String(currentValue)}</Typography>
            </Item>
            <Item>
              <FieldInfo />
            </Item>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  )
}

export default MoreInfoCardContainer