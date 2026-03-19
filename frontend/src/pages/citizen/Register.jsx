import { useState } from 'react'
import { register } from '../../services/api'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      const res = await register(form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', res.data.role)
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Try again.'
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

        <input type="text" name="name" placeholder="Full Name"
          className="w-full border p-2 rounded mb-4"
          onChange={handleChange} />

        <input type="email" name="email" placeholder="Email"
          className="w-full border p-2 rounded mb-4"
          onChange={handleChange} />

        <input type="password" name="password" placeholder="Password"
          className="w-full border p-2 rounded mb-6"
          onChange={handleChange} />

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p className="text-center text-sm mt-4 text-gray-500">
          Already have an account?{' '}
          <Link to="/" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </form>
    </div>
  )
}