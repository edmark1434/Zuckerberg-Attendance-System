import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {BrowserRouter} from "react-router-dom";
import LenisProvider from "@/components/providers/LenisProvider.tsx";
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LenisProvider />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
