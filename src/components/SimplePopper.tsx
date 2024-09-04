// import { Popper} from '@mui/base/Popper'
import { Popper } from '@mui/material'
import { styled, css } from '@mui/system'
import React, { useState, MutableRefObject, FC } from 'react'
export const SimplePopper: FC<{
  anchorRef: MutableRefObject<any>
  message: string | null
  placement?: any

}> = ({ anchorRef, message, placement = "bottom" }) => {
  const id = 'simple-popper'
  return (
    <>
      {message && (
        <Popper id={id} open={true} anchorEl={anchorRef.current} placement={placement}>
          <StyledPopperDiv>{message}</StyledPopperDiv>
        </Popper>
      )}
    </>
  )
}


const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
}



const StyledPopperDiv = styled('div')(
  ({ theme }) => css`
    background-color: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border-radius: 8px;
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    box-shadow: ${theme.palette.mode === 'dark'
      ? `0px 4px 8px rgb(0 0 0 / 0.7)`
      : `0px 4px 8px rgb(0 0 0 / 0.1)`};
    padding: 0.75rem;
    color: ${theme.palette.mode === 'dark' ? grey[100] : grey[700]};
    font-size: 0.875rem;
    font-family: 'IBM Plex Sans', sans-serif;
    font-weight: 500;
    opacity: 1;
    margin: 0.25rem 0;
  `
)
