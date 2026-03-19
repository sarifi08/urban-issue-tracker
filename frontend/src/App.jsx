import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/citizen/Login'
import Register from './pages/citizen/Register'
import SubmitReport from './pages/citizen/SubmitReport'
import MyReports from './pages/citizen/MyReports'
import Dashboard from './pages/staff/Dashboard'
import AdminPanel from './pages/admin/AdminPanel'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/submit" element={<SubmitReport />} />
        <Route path="/my-reports" element={<MyReports />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  )
}