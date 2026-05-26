import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Toast from './components/shared/Toast.jsx'
import useStore from './store/useStore.js'

function PrivateRoute({ children }) {
  const token = useStore(s => s.token)
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
