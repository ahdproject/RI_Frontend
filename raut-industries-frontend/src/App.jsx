import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setUser, clearUser } from './app/DashboardSlice'
import { loadSession } from './utils/helpers'
import RoutesConfig from './RoutesConfig'

export default function App() {
  const dispatch = useDispatch()

  // Rehydrate auth state from localStorage on refresh
  useEffect(() => {
    const session = loadSession()
    if (session && session.token && session.user) {
      dispatch(setUser({ token: session.token, user: session.user }))
    } else {
      // Ensure clean state if no session
      dispatch(clearUser())
      // Clear any orphaned tokens
      localStorage.removeItem('raut_token')
      localStorage.removeItem('raut_user')
    }
  }, [dispatch])

  return <RoutesConfig />
}