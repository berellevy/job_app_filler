import { TypographyProps, Typography, Box } from "@mui/material"
import React, { FC } from "react"

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
          {body.map((item, index) => {
            return <li key={index}>{item}</li>
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
        {updates.map((update, index) => {
          return <UpdateComponent key={index} update={update} />
        })}
      </Box>
    </Box>
  )
}

export const releases: Release[] = [
  {
    version: "2.1.1",
    date: "12/3/24",
    updates: [
      {
        title: "greenhouse.io",
        body: [
          "Added Month-Year field, Searchable Dropdown field and Employment repeating section.",
          "Fixed autofill for Dropdown with Multi Select. However it can still only save and fill one value."
        ]
      }
    ]
  },
  {
    version: "2.1.0",
    date: "11/19/24",
    updates: [
      {
        title: "job-boards.greenhouse.io Added!",
        body: "All fields. Repeating sections work. (Dropdowns that allow more than one selection can only be autofilled with one selection for now."
      }, 

      {
        title: "Bugs",
        body: [
          "job-boards.greenhouse (the newer one): page scroll behaves more erratic than usual when autofilling.",
          "boards.greenhous (the older one): Searchable Dropdown fields don't always autofill."
        ]
      }
    ]
  },
  {
    version: "2.0.0",
    date: "11/6/24",
    updates: [
      {
        title: "greenhouse.io Added!",
        body: [
          "Added support for greenhouse.io*",
          "Most common fields, including dropdowns, that address field and file upload.",
          "The remaining fields will be added after job-boards.greenhouse.io.",
          "*boards.greenhouse.io, not job-boards.greenhouse.io, which will be added in the next update."
        ]
      }
    ]
  },
  {
    version: "1.0.10",
    date: "10/6/24",
    updates: [
      {
        title: "UI",
        body: [
          "Saving Answers is now even easier. Just fill and save."
        ],
      },
      {
        title: "General",
        body: "There's a new how-to vid on youtube."
      }
    ]
  },
  {
    version: "1.0.9",
    date: "9/26/24",
    updates: [
      {
        title:  "UI",
        body: [
          "Widgets don't show up on search page",
          "Clicking outside closes the popup.",
          "Pressing escape closes the popup."
        ],
      },

    ]
  },
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
      {
        title: "Autofill",
        body: "Make pages match if both share a prefix."
      },
      {
        title: "Bugs",
        body: "fix bug where number inputs appear filled but don't work at final submit."
      }
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

