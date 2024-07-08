import React from 'react'
import { getElement, getElements } from '../utils/getElements'
import { createRoot } from 'react-dom/client'
import '@fontsource/roboto'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { Box, Paper } from '@mui/material'
import {uid } from '../utils/uid'
import { saveRequest } from '../utils/storage'

export type FieldPath = {
  page: string
  section: string
  fieldType: string
  fieldName: string
}

export type FieldSnapshot = FieldPath & {
  answer: string | null
}




export const SaveButton: React.FC<{
  onClick?: () => void
}> = ({ onClick }) => {
  return (
    <Paper sx={{ display: 'inline-block' }}>
      <Box m={'8px'}>
        <Button onClick={onClick}>
          <Typography>Save</Typography>
        </Button>
      </Box>
    </Paper>
  )
}
const attachReactApp = (app: React.ReactNode, inputContainer: HTMLElement) => {
  // cant just append the react app to the root element...
  // it makes the element disappear
  const rootElement = document.createElement('div')
  inputContainer.appendChild(rootElement)
  createRoot(rootElement).render(app)
}

export const getReactProps = (element: HTMLElement): any => {
  for (const key in element) {
    if (key.startsWith('__reactProps')) return element[key]
  }
}

export class BaseFormInput {
  static XPATH: string
  element: HTMLElement
  uid: string

  constructor(element: HTMLElement) {
    this.element = element
    this.uid = uid()
    element.setAttribute('job-app-filler', this.uid)
    attachReactApp(<SaveButton onClick={() => this.save()} />, element)

  }

  static async autoDiscover(node: Node = document) {
    const elements = getElements(node, this.XPATH)
    elements.forEach((el) => {
      if (!el.hasAttribute('job-app-filler')) {
        const input = new this(el)
      }
    })
  }

  public get page(): string {
    return getElement(document, './/h2').innerText
  }
  public get fieldType(): string {
    return this.constructor.name
  }
  public get fieldName(): string {
    return getElement(this.element, './/label').innerText
  }

  public get section(): string {
    // must always return a string, even a blank one
    return ""
  }

  public get path(): FieldPath {
    return {
      page: this.page,
      section: this.section,
      fieldType: this.fieldType,
      fieldName: this.fieldName,
    }
  }

  public get currentValue(): string {
    throw new Error("Getter 'currentValue' must be implemented by all subclasses of BaseFormInput")
    return ''
  }

  public get fieldSnapshot(): FieldSnapshot {
    return {
      ...this.path,
      answer: this.currentValue,
    }
  }
  save() {
    saveRequest(this.uid, this.fieldSnapshot)
  }
}
