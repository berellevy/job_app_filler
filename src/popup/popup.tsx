import { createRoot } from "react-dom/client"
import { App } from "./app/App"
import React from 'react'


const rootel = document.createElement('div')
document.body.appendChild(rootel)

const root = createRoot(rootel)
root.render(<App />)
