import React, { useEffect, useRef, useState } from 'react';
import { Typography, Box, Link } from '@mui/material';

// const ExpandableText = ({
//   text,
//   maxLength = 100, // Maximum characters to show before truncation
// }: {
//   text: string;
//   maxLength?: number;
// }) => {
//   const [expanded, setExpanded] = useState(false);

//   const handleToggle = () => {
//     setExpanded((prev) => !prev);
//   };

//   const isTruncated = text.length > maxLength;
//   const displayText = expanded || !isTruncated
//     ? <Box display={"inline"}>{text}</Box>
//     : <Box display={"inline"}>{`${text.slice(0, maxLength)}...`}</Box>;
//   return (
//     <>
//       {displayText}
//       {isTruncated && (
//         <Link
//           component="button"
//           variant="body2"
//           sx={{ ml: 1 }}
//           onClick={handleToggle}
//         >
//           {expanded ? 'Less' : 'More'}
//         </Link>
//       )}
//     </>
//   );
// };


const ExpandableText = ({
  text,
  maxLength = 100, // Maximum characters to show before truncation
}: {
  text: string;
  maxLength?: number;
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    setExpanded((prev) => !prev);
  };

  const displayText = expanded
    ? <Box display={"inline"}>{text}</Box>
    : <Box display={"inline"}>{`${text.slice(0, maxLength)}...`}</Box>;
  return (

    <Box>
      {displayText}
      { (
        <Link
          component="button"
          variant="body2"
          sx={{ ml: 1 }}
          onClick={handleToggle}
        >
          {expanded ? 'Less' : 'More'}
        </Link>
      )}
    </Box>
  );
};
export default ExpandableText;




