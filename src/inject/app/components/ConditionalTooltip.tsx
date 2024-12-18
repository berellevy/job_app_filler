import { TooltipProps, Tooltip } from "@mui/material"
import React, { FC } from "react"

export const ConditionalTooltip: FC<{ showIf: boolean } & TooltipProps> = ({ showIf, children, ...tooltipProps }) => {
  return (
    showIf
      ? <Tooltip {...tooltipProps}>
        {children}
      </Tooltip>
      : <>{children}</>
  )
}