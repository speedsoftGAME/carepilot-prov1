import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore.js'
import { login as apiLogin, register as apiRegister } from '../api/auth.js'

export function useAuth() {
  const navigate = useNavigate()
  const { setAuth, logout: storeLogout, addToast } = useStore()

  const login = async (email, password) => {
    const data = await apiLogin(email, password)
    setAuth(data)
    navigate('/dashboard')
  }

  const register = async (companyName, email, password, name) => {
    const data = await apiRegister(companyName, email, password, name)
    setAuth(data)
    navigate('/onboarding')
  }

  const logout = () => {
    storeLogout()
    navigate('/login')
  }

  return { login, register, logout }
}
