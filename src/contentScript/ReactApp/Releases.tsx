import { TypographyProps, Typography, Box, List, ListItem, ListItemText, ListItemIcon } from "@mui/material"
import React, { FC } from "react"
import { FiberManualRecordIcon } from "../../utils/icons"

const Bold = (props: TypographyProps) => {
  props = { 
    sx: { fontWeight: 'bold', ...props.sx }, 
    component: "span",
    ...props 
  }
  return (<Typography {...props}/>)
}

type Digit = `${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`
type TwoDigits = `${Digit}${Digit}`
type Version = `${Digit}.${Digit}.${Digit | TwoDigits}`

type Update = {
  title: string
  body: string | string[]
}


type Release = {
  version: Version,
  date: string
  updates: Update[]
}

const UpdateComponent: FC<{update: Update}> =  ({update}) => {
  const {body, title} = update
  return Array.isArray(body) ? (
    <>
      <Bold>{title}</Bold>
      <Typography>
        <ul style={{ listStyle: 'initial', paddingLeft: '1.3em' }}>
          {body.map((item) => {
            return <li>{item}</li>
          })}
        </ul>
      </Typography>
    </>
  ) : (
    <>
      <Bold>{title}</Bold>
      <Typography sx={{pl: ".3em"}}>{body}</Typography>
    </>
  )
}

export const ReleaseComponent: FC<{release: Release}> = ({release}) => {
  const {version, date, updates} = release
  return (
    <Box>
      <Typography variant="h6">
        Version {version} - {date}
      </Typography>
      <Box sx={{ pl: '.5em' }}>
        {updates.map((update) => {
          return <UpdateComponent update={update} />
        })}
      </Box>
    </Box>
  )
}

export const releases: Release[] = [
  {
    version: '1.0.8',
    date: '9/12/24',
    updates: [
      {
        title: 'Workday Fields',
        body: [
          'Multi checkbox field.',
          'm/d/y Date Field. Can be set as relative or absolute.',
          'Multi file upload.',
        ],
      },
    ],
  },
  {
    version: '1.0.7',
    date: '9/4/24',
    updates: [
      {
        title: 'Autofill',
        body: [
          'Vastly improved answer management UI.',
          'Edit stored questions and answers.',
          'Advanced answer matching.',
        ],
      },
      { title: 'Bugs', body: 'Various bug fixes.' },
    ],
  },
  {
    version: '1.0.6',
    date: '8/9/24',
    updates: [
      {
        title: 'Workday Fields',
        body: [
          'Year input and field of study (in education).',
          'yes/no radio.',
        ],
      },
      {
        title: 'Autofill',
        body: 'Ability to add backup answers to single dropdowns (searchable as well).',
      },
      {
        title: 'Popup',
        body: ['Contact button.', "'What's New' dialog (that's me!)."],
      },
    ],
  },
  {
    version: '1.0.5',
    date: '8/4/24',
    updates: [
      {
        title: 'Workday Fields',
        body: [
          'single checkbox.',
          'Date field (month/year). Try it out on Work Experience!',
        ],
      },
      { title: 'UI', body: 'Added badges for saved and filled.' },
    ],
  },
  {
    version: '1.0.4',
    date: '7/31/24',
    updates: [
      {
        title: 'Workday Fields',
        body: 'Searchable dropdown field.',
      },
      { title: 'UI', body: 'Fix sync issue' },
    ],
  },
  {
    version: '1.0.3',
    date: '7/25/24',
    updates: [
      {
        title: 'Workday Fields',
        body: 'Added support for simple dropdown fields.',
      },
    ],
  },
]

