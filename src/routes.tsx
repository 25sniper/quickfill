import React from 'react'
import { Routes, Route } from 'react-router-dom'
import App from './App'
import Checkout from './Checkout'
import AdminDashboard from './AdminDashboard'
import AlignmentTool from './AlignmentTool'
import AnimationStudio from './AnimationStudio'

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/align" element={<AlignmentTool />} />
      <Route path="/animate" element={<AnimationStudio />} />
      {/* Fallback to Home for unknown paths */}
      <Route path="*" element={<App />} />
    </Routes>
  )
}

export default AppRoutes
