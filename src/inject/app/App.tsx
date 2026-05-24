import React, { FC } from 'react'
import { createRoot } from 'react-dom/client'

import { ContextProvider } from './AppContext'

import { BaseFormInput } from './services/formFields/baseFormInput'
import { FieldWidgetButtons } from './FieldWidget/FieldWidgetButtons'

/**
 * Per-field mount. In the HiredSignal model this renders nothing visible —
 * `FieldWidgetButtons` only registers the field's backend with the page-global
 * `HsAutofillBar` (see `hsBarSingleton`). All visible UX lives in that single
 * floating bar, not at each field.
 */
const Main: FC = () => {
  return <FieldWidgetButtons />
}

export const App: React.FC<{
  backend: BaseFormInput<any>
}> = ({ backend }) => {
  return (
    <ContextProvider backend={backend}>
      <Main />
    </ContextProvider>
  )
}

export const attachReactApp = (
  app: React.ReactNode,
  inputContainer: HTMLElement
) => {
  // cant just append the react app to the root element...
  // it makes the element disappear
  const rootElement = document.createElement('div')
  inputContainer.insertBefore(rootElement, inputContainer.lastChild)
  createRoot(rootElement).render(app)
}
