import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import './assets/css/glass-theme.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext'

import "datatables.net-buttons-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "datatables.net-bs5";

import "datatables.net-select-bs5";

import "datatables.net-buttons/js/dataTables.buttons";
import "datatables.net-buttons/js/buttons.html5";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
