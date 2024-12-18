import React, { useState, FC, useRef, useEffect } from 'react';
import { Typography, Box, Link } from '@mui/material';
import { ConditionalTooltip } from './ConditionalTooltip';



/**
 * Full featured expandable text...
 * If text is truncated, has a tooltip and expands on click.
 * @param param0 
 * @returns 
 */
export const ExpandableText: FC<{ text: string; maxLines?: number; }> = ({
  text,
  maxLines = 1,
}) => {

  const [expanded, setExpanded] = useState(false);
  const textRef = useRef<HTMLElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)

  useEffect(() => {
    const element = textRef.current;
    if (element) {
      // Check if the content is overflowing
      setIsTruncated(element.scrollHeight > element.clientHeight);
    }
  }, [text]); // Runs when the text changes


  const CollapseButton = (
    expanded &&
    <Link
      component="span"
      variant='body1'
      sx={{ ml: 1 }}
      onClick={() => setExpanded(false)}
    >
      Collapse
    </Link>
  )

  const expandable = isTruncated && !expanded

  return (
    <Box>
      <ConditionalTooltip showIf={expandable} title="Click to expand.">
        <Typography
          variant="inherit"
          component="span"
          ref={textRef}
          sx={{
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            WebkitLineClamp: expanded ? 'unset' : maxLines,
          }}
          onClick={() => expandable && setExpanded(true)}
        >
          {text}
          {CollapseButton}
        </Typography>
      </ConditionalTooltip>
    </Box>
  );
};
