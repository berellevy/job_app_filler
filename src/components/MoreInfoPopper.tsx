import {
  Box,
  Button,
  Card,
  CardHeader,
  CardContent,
  Fade,
  IconButton,
  Paper,
  Popper,
  CircularProgress,
} from '@mui/material'
import React, { ReactNode, useState } from 'react'
import { useAppContext } from '../AppContext'
import { MoreVertIcon, CloseIcon, RefreshIcon } from '../utils/icons'
import { sleep } from '../utils/async'

export const MoreInfoPopper: React.FC<{
  children: ReactNode
  title: string
}> = ({ children, title }) => {
  const { moreInfoPopper, init } = useAppContext()
  const id = moreInfoPopper.isOpen ? `more-info-popper` : undefined

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const handleRefreshClick = async () => {
    setIsRefreshing(true)
    await init()
    setIsRefreshing(false)
  }

  return (
    <Button
      type="button"
      variant={moreInfoPopper.isOpen ? 'contained' : 'outlined'}
      onClick={moreInfoPopper.handleToggleButtonClick}
    >
      {moreInfoPopper.isOpen ? <CloseIcon /> : <MoreVertIcon />}
      <Popper
        id={id}
        open={moreInfoPopper.isOpen}
        anchorEl={moreInfoPopper.anchorEl}
        placement="right-end"
        transition
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Box mx={1}>
              <Paper elevation={8}>
                <Box
                  mt={2}
                  sx={{
                    maxWidth: 'calc(50vw)',
                    maxHeight: 400,
                    overflow: 'scroll',
                  }}
                >
                  <Card>
                    <CardHeader
                      sx={{ padding: 1 }}
                      title={title}
                      action={
                        <>
                          <IconButton onClick={handleRefreshClick}>
                            {isRefreshing ? (
                              <CircularProgress size={'1em'} />
                            ) : (
                              <RefreshIcon />
                            )}
                          </IconButton>
                          <IconButton
                            aria-label="close"
                            onClick={moreInfoPopper.close}
                            sx={{ marginLeft: 'auto' }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </>
                      }
                    />
                    <CardContent
                      sx={{ padding: 0, paddingBottom: '0px!important' }}
                    >
                      {children}
                    </CardContent>
                  </Card>
                </Box>
              </Paper>
            </Box>
          </Fade>
        )}
      </Popper>
    </Button>
  )
}
