import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './style.css'
import { logDeploymentCheckResults } from './utils/deployment-check'

// Run deployment checks in development
logDeploymentCheckResults()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
