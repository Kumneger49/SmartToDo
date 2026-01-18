/**
 * Application Entry Point
 * 
 * Initializes React application and renders root App component
 * Uses React.StrictMode for development warnings and optimizations
 * 
 * @fileoverview Main entry point for BarakaFlow application
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create React root and render application
// StrictMode enables additional checks and warnings in development
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
