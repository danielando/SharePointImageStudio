import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthProvider from './components/AuthProvider.tsx'
import Home from './pages/Home.tsx'
import Pricing from './pages/Pricing.tsx'
import Profile from './pages/Profile.tsx'
import Privacy from './pages/Privacy.tsx'
import CheckoutSuccess from './pages/CheckoutSuccess.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)
