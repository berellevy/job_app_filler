import { styled, Theme } from "@mui/material/styles";
import Switch, { switchClasses } from "@mui/material/Switch";
import { theme } from "@src/shared/utils/react";

theme

export const AbsoluteRelativeSwitch = styled(Switch)({
  width: 110,
  height: 48,
  padding: 8,
  [`& .${switchClasses.switchBase}`]: {
    padding: 11,
    // color: "#ff6a00",
  },
  [`& .${switchClasses.thumb}`]: {
    width: 26,
    height: 26,
    backgroundColor: '#fff',
  },
  [`& .${switchClasses.track}`]: {
    background: theme.palette.primary.main,
    
    opacity: '1 !important',
    borderRadius: 20,
    position: 'relative',
    '&:before, &:after': {
      display: 'inline-block',
      position: 'absolute',
      top: '50%',
      width: '50%',
      transform: 'translateY(-50%)',
      color: '#fff',
      textAlign: 'center',
      fontSize: '0.75rem',
      fontWeight: 500,
    },
    '&:before': {
      content: '"Relative"',
      left: 11,
      opacity: 0,
    },
    '&:after': {
      content: '"Absolute"',
      right: 13,
    },
  },
  [`& .${switchClasses.checked}`]: {
    [`&.${switchClasses.switchBase}`]: {
      color: '#185a9d',
      transform: 'translateX(62px)',
      '&:hover': {
        backgroundColor: 'rgba(24,90,257,0.08)',
      },
    },
    [`& .${switchClasses.thumb}`]: {
      backgroundColor: '#fff',
    },
    [`& + .${switchClasses.track}`]: {
      background: 'primary',
      '&:before': {
        opacity: 1,
      },
      '&:after': {
        opacity: 0,
      },
    },
  },
})