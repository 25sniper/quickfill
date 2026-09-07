import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AlignmentTool from './AlignmentTool.tsx'
import AnimationStudio from './AnimationStudio.tsx'
import Checkout from './Checkout.tsx'
import AdminDashboard from './AdminDashboard.tsx'

const path = window.location.pathname

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {path === '/align'   ? <AlignmentTool />    :
     path === '/animate' ? <AnimationStudio />  :
     path === '/checkout'? <Checkout />         :
     path === '/admin'   ? <AdminDashboard />   :
     <App />}
  </StrictMode>,
)
