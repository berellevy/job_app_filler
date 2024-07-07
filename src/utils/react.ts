import React from "react"
import ReactDOM from "react-dom/client"

export const attachReactApp = (app: React.ReactNode, rootElement: HTMLElement) => {
    const root = ReactDOM.createRoot(rootElement)
    root.render(app)
}