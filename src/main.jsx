import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import BaggageHUD from '../baggage-hud.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BaggageHUD />
  </StrictMode>
)
