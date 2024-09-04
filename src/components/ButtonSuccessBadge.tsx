import styled from '@emotion/styled'
import { Fade } from '@mui/material'
import Badge, { BadgeProps } from '@mui/material/Badge'
import React, { FC } from 'react'
import { CheckCircleIcon } from '../utils/icons'

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: 7,
    top: 6.5,
  },
}))

type ButtonSuccessBadgeProps = BadgeProps & {
  show: boolean
}

export const ButtonSuccessBadge: FC<ButtonSuccessBadgeProps> = ({
  show,
  ...props
}) => {
  return (
    <StyledBadge
      badgeContent={
        <Fade in={show}>
          <CheckCircleIcon color="success" sx={{ fontSize: '.6rem' }} />
        </Fade>
      }
    >
      {props.children}
    </StyledBadge>
  )
}
