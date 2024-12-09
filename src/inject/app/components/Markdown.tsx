import { Button, ButtonTypeMap } from '@mui/material'
import React, { FC } from 'react'
import { OpenInNewIcon } from '@src/shared/utils/icons'
import MuiMarkdown, { getOverrides, MuiMarkdownProps } from 'mui-markdown'

const MarkdownLink: FC<{ children: string; href: string }> = ({
  children,
  href,
}) => {
  return (
    <Button
      variant="text"
      sx={{ color: 'inherit' }}
      target="_blank"
      href={href}
      endIcon={<OpenInNewIcon />}
    >
      {children}
    </Button>
  )
}

export const Markdown: FC<MuiMarkdownProps> = ({ children }) => {
  return (
    <MuiMarkdown overrides={{ ...getOverrides(), a: MarkdownLink }}>
      {children}
    </MuiMarkdown>
  )
}
