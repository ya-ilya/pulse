import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom'
import axios from 'axios'
import { createGatway, GatewayContext, isGatewayOpen } from './gateway/index.ts'
import Login from './components/login/Login.tsx'

export const axiosClient = axios.create({
  baseURL: window.location.origin
})

function ProtectedRoute() {
  const [authenticated, setAuthenticated] = useState<boolean>()
  const [lastEvent, setLastEvent] = useState<any>(null)

  useEffect(() => {
    const check = async () => {
      if (localStorage.getItem('accessToken')) {
        if (!isGatewayOpen()) {
          createGatway(`${window.location.origin}/api/gateway`, setLastEvent)
        }
      } else {
        setAuthenticated(false)
      }
    }

    check()
  }, [])

  useEffect(() => {
    if (lastEvent?.type == "AuthenticationEvent") {
      if (lastEvent.state === true) {
        setAuthenticated(true)
      } else {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        setAuthenticated(false)
      }
    }
  }, [lastEvent])

  if (authenticated === undefined) {
    return <div></div>
  }

  if (!authenticated) {
    return <Navigate to="/login" replace/>
  }

  return (
    <GatewayContext.Provider value={lastEvent}>
      <Outlet/>
    </GatewayContext.Provider>
  )
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <Login/>
    )
  },
  {
    element: <ProtectedRoute/>,
    children: [
      {
        path: "/",
        element: <App/>
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
)
