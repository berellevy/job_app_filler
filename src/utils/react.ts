import React from 'react'
import ReactDOM from 'react-dom/client'

export const attachReactApp = (
  app: React.ReactNode,
  rootElement: HTMLElement
) => {
  const root = ReactDOM.createRoot(rootElement)
  root.render(app)
}

export const getReactProps = (element: HTMLElement): any => {
  console.log("getReactProps");
  
  // for (const key in element) {
  //   if (key.startsWith("__reactProps"))
  //     return element[key]
  // }
}
