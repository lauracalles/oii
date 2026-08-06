import { useState } from 'react'
import LoginPage from './components/LoginPage.jsx'
import Dashboard from './components/Dashboard.jsx'

export default function App() {
  // Autenticação apenas de fachada: sem backend, credencial fixa no client.
  // Ver LoginPage.jsx para o comentário completo sobre essa limitação.
  const [authed, setAuthed] = useState(false)
  const [user, setUser] = useState(null)

  if (!authed) {
    return <LoginPage onSuccess={(u) => { setUser(u); setAuthed(true) }} />
  }

  return <Dashboard user={user} onLogout={() => { setAuthed(false); setUser(null) }} />
}
