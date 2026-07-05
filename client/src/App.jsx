import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import AppRoutes from './routes/AppRoutes'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import { Store } from "./redux/Store";
import { Provider } from "react-redux";
function App() {
  let HOME_PAGE = import.meta.env.VITE_BASE_URL;
  return (
    <>
      <BrowserRouter  basename={HOME_PAGE}>
        <Provider store={Store}>
           
          <AppRoutes />
        </Provider>
      </BrowserRouter>

      <ToastContainer />
    </>
  )
}

export default App
