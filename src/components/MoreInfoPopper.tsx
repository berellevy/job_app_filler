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
} from '@mui/material'
import React, { ReactNode, useState, MouseEvent } from 'react'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import CloseIcon from '@mui/icons-material/Close'

export const MoreInfoPopper: React.FC<{
  children: ReactNode
  title: string
}> = ({ children, title }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const isOpen = Boolean(anchorEl)
  const id = isOpen ? `more-info-popper` : undefined

  const closePopper = () => {
    setAnchorEl(null)
  }

  /**
   * only close the popper when the more info button itself
   * is clicked. Not when the popper body is clicked.
   */
  const handleMoreInfoClick = (e: MouseEvent<HTMLElement>) => {
    if (!isOpen) {
      setAnchorEl(e.currentTarget)
    } else if (e.currentTarget.contains(e.target as Node)) {
      closePopper()
    }
  }

  return (
    <Button type="button" onClick={handleMoreInfoClick}>
      <MoreVertIcon />
      <Popper
        id={id}
        open={isOpen}
        anchorEl={anchorEl}
        placement="right-start"
        transition
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Box mx={1}>
              <Paper elevation={8}>
                <Card>
                  <CardHeader
                    sx={{ padding: 1 }}
                    title={title}
                    action={
                      <IconButton
                        aria-label="close"
                        onClick={closePopper}
                        sx={{ marginLeft: 'auto' }}
                      >
                        <CloseIcon />
                      </IconButton>
                    }
                  />
                  <CardContent
                    sx={{ padding: 0, paddingBottom: '0px!important' }}
                  >
                    {children}
                  </CardContent>
                </Card>
              </Paper>
            </Box>
          </Fade>
        )}
      </Popper>
    </Button>
  )
}
