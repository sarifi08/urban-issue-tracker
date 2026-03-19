import { useEffect, useState } from 'react'
import { getAllReports } from '../../services/api'
import { useNavigate } from 'react-router-dom'

export default function AdminPanel() {
  const [stats, setStats] = useState({
    total: 0, submitted: 0,
    underReview: 0, inProgress: 0, resolved: 0
  })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getAllReports()
        const reports = res.data
        setStats({
          total: reports.length,
          submitted: reports.filter(r => r.status === 'submitted').length,
          underReview: reports.filter(r => r.status === 'under review').length,
          inProgress: reports.filter(r => r.status === 'in progress').length,
          resolved: reports.filter(r => r.status === 'resolved').length,
        })
      } catch (err) {
        alert('Failed to load stats.')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    { label: 'Total Reports', value: stats.total, color: 'bg-blue-600' },
    { label: 'Submitted', value: stats.submitted, color: 'bg-gray-500' },
    { label: 'Under Review', value: stats.underReview, color: 'bg-yellow-500' },
    { label: 'In Progress', value: stats.inProgress, color: 'bg-blue-400' },
    { label: 'Resolved', value: stats.resolved, color: 'bg-green-500' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">👨‍💼 Admin Panel</h1>
        <button
          onClick={() => { localStorage.clear(); navigate('/') }}
          className="px-4 py-1 rounded text-sm bg-red-100 text-red-600 hover:bg-red-200">
          Logout
        </button>
      </div>

      <div className="p-6 max-w-5xl mx-auto">

        {/* Stats */}
        <h2 className="text-lg font-bold mb-4">📊 System Statistics</h2>
        <div className="grid grid-cols-5 gap-4 mb-8">
          {statCards.map(card => (
            <div key={card.label} className="bg-white rounded-xl shadow p-4 text-center">
              <div className={`text-2xl font-bold text-white ${card.color} rounded-lg py-2 mb-2`}>
                {loading ? '...' : card.value}
              </div>
              <div className="text-xs text-gray-500">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Manage Staff */}
        <h2 className="text-lg font-bold mb-4">👥 Manage Staff Accounts</h2>
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex gap-3 mb-4">
            <input type="text" placeholder="Full Name"
              className="border p-2 rounded text-sm flex-1" />
            <input type="email" placeholder="Email"
              className="border p-2 rounded text-sm flex-1" />
            <input type="password" placeholder="Password"
              className="border p-2 rounded text-sm flex-1" />
            <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
              Add Staff
            </button>
          </div>
          <p className="text-xs text-gray-400">
            New staff members will receive an email with their login credentials.
          </p>
        </div>

        {/* Manage Categories */}
        <h2 className="text-lg font-bold mb-4">📁 Manage Categories</h2>
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex gap-3 mb-4">
            <input type="text" placeholder="New category name"
              className="border p-2 rounded text-sm flex-1" />
            <button className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
              Add Category
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Pothole', 'Broken Streetlight', 'Graffiti', 'Illegal Dumping', 'Other'].map(cat => (
              <span key={cat}
                className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full flex items-center gap-2">
                {cat}
                <button className="text-red-400 hover:text-red-600 text-xs">✕</button>
              </span>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <h2 className="text-lg font-bold mb-4">🔗 Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white rounded-xl shadow p-6 text-left hover:shadow-md transition">
            <div className="text-2xl mb-2">🏛️</div>
            <div className="font-bold">Go to Staff Dashboard</div>
            <div className="text-sm text-gray-500">View and manage all reports</div>
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-white rounded-xl shadow p-6 text-left hover:shadow-md transition">
            <div className="text-2xl mb-2">🏙️</div>
            <div className="font-bold">Go to Citizen View</div>
            <div className="text-sm text-gray-500">See the app as a citizen</div>
          </button>
        </div>

      </div>
    </div>
  )
}