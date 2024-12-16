import { Box } from '@mui/material'
import React, { FC } from 'react'
import { MoreInfoHeader } from './MoreInfoHeader'
import MoreInfoBody from './MoreInfoBody'


const MoreInfoContainer: FC = () => {
    return (
        <Box sx={{
            width: 'calc(45vw)',
            maxHeight: "400"
        }}>
            <MoreInfoHeader />
            <MoreInfoBody />
        </Box>
    )
}

export default MoreInfoContainer