import { useState } from "react"
import { creaateAuthenticationController, createMeController } from "../../api"
import { Navigate } from "react-router-dom"
import './Login.css'

function Login() {
  const [authenticationController] = useState(creaateAuthenticationController())

  const [email, setEmail] = useState<string>("ilya@mail.com")
  const [password, setPassword] = useState<string>("password")
  const [done, setDone] = useState(localStorage.getItem('accessToken') != null)
  
  function handleSubmit() {
    authenticationController
      .signIn({ email: email, password: password })
      .then(response => {
        localStorage.setItem('accessToken', response.accessToken)
        localStorage.setItem('refreshToken', response.refreshToken)

        createMeController().getUser().then(user => {
          localStorage.setItem('user', JSON.stringify(user))
          setDone(true)
        })
      })
  }

  if (done) {
    return <Navigate to="/" replace/>
  }

  return (
    <div className="login">
      <div className="form">
        <div className="header">Welcome</div>
        <input type="text" placeholder="Email" className="input" value={email} onChange={(event) => setEmail(event.target.value)}/>
        <input type="text" placeholder="Password" className="input" value={password} onChange={(event) => setPassword(event.target.value)}/>
        <button type="submit" className="submit" onClick={handleSubmit}>Login</button>
      </div>
    </div>
  )
}

export default Login