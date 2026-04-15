import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setUser } from './app/DashboardSlice'
import { loadSession } from './utils/helpers'
import RoutesConfig from './RoutesConfig'

export default function App() {
  const dispatch = useDispatch()

  // Rehydrate auth state from localStorage on refresh
  useEffect(() => {
    const session = loadSession()
    if (session) {
      dispatch(setUser({ token: session.token, user: session.user }))
    }
  }, [dispatch])

  return <RoutesConfig />
}