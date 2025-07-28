import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { RecoilRoot } from 'recoil'
import { BrowserRouter } from 'react-router-dom'
import { FetchDetails } from './Components/FetchFriends.jsx'
createRoot(document.getElementById('root')).render(
  <RecoilRoot>
  <BrowserRouter>
  <FetchDetails>
    <App />
    </FetchDetails>
  </BrowserRouter>
  </RecoilRoot>
)
