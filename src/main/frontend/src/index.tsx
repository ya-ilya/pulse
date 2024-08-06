import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createMeController, createAuthenticationController, MeControllerApi, createChannelController } from './api/api.ts'
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom'

export const GatewayContext = React.createContext<any | null>(null)

export function useGatewayContext() {
  return React.useContext(GatewayContext)
}

async function isTokenValid(token: string | null, meController: MeControllerApi): Promise<boolean> {
  if (!token) return false

  const decodedToken = JSON.parse(atob(token.split('.')[1]))
  const expirationTime = decodedToken.exp * 1000

  let withoutErrors = true

  try {
    await meController.getUser()
  } catch (error) {
    withoutErrors = false
  }

  return Date.now() < expirationTime && withoutErrors
}

var websocket: WebSocket | undefined

function ProtectedRoute() {
  const [authenticationController] = useState(createAuthenticationController())
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [lastEvent, setLastEvent] = useState<any>(null)

  useEffect(() => {
    const check = async () => {
      if (!localStorage.getItem('accessToken')) {
        var sigma = await authenticationController.signUp({
          username: "Sigma",
          email: "sigma@mail.com",
          password: "sigma"
        })
        localStorage.setItem('accessToken', sigma.data.accessToken)
        var chad = await authenticationController.signUp({
          username: "Chad",
          email: "chad@mail.com",
          password: "chad"
        })
        const channelController = createChannelController()
        var groupChat = await channelController.createGroupChatChannel({ name: "Group Chat", with: [ chad.data.userId ] })
        await channelController.createMessage({ content: "Hello, Chad!" }, groupChat.data.id!)
        localStorage.setItem('accessToken', chad.data.accessToken)
        const chadChannelController = createChannelController()
        chadChannelController.createMessage({ content: "Oh, hello, Sigma. I love you!"}, groupChat.data.id!)
        localStorage.setItem('accessToken', sigma.data.accessToken)
      }

      if (await isTokenValid(localStorage.getItem('accessToken'), createMeController())) {
        websocket = new WebSocket(`${window.location.origin}/gateway`)

        websocket.onopen = () => {
          websocket?.send(localStorage.getItem('accessToken')!)
        }

        websocket.onmessage = (event) => {
          const data = JSON.parse(event.data)

          if (data["type"]) {
            setLastEvent(data)
          }
        }

        setAuthenticated(true)
      } else {
        try {
          const response = await authenticationController.refreshToken({
            refreshToken: localStorage.getItem('refreshToken')!
          })

          localStorage.setItem('accessToken', response.data.accessToken)
          localStorage.setItem('refreshToken', response.data.refreshToken)
          setAuthenticated(true)
        } catch (error) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          setAuthenticated(false)
        }
      }
    }

    check()
  })

  if (authenticated === null) {
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
      <div>
        Login Page
      </div>
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
