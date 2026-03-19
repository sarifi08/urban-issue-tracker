import { useEffect, useState } from 'react'
import { getMyReports } from '../../services/api'
import { useNavigate } from 'react-router-dom'

const statusColors = {
  submitted: 'bg-gray-200 text-gray-700',
  'under review': 'bg-yellow-100 text-yellow-700',
  'in progress': 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
}

export default function MyReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await getMyReports()
        setReports(res.data)
      } catch (err) {
        alert('Failed to load reports.')
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Reports</h2>
          <button
            onClick={() => navigate('/submit')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
            + New Report
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-center text-gray-500">Loading your reports...</p>
        )}

        {/* Empty state */}
        {!loading && reports.length === 0 && (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-gray-500 text-lg mb-4">You haven't submitted any reports yet.</p>
            <button
              onClick={() => navigate('/submit')}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Submit your first report
            </button>
          </div>
        )}

        {/* Report cards */}
        {!loading && reports.map((report) => (
          <div key={report.id} className="bg-white rounded-xl shadow p-6 mb-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">{report.title}</h3>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[report.status] || 'bg-gray-100 text-gray-600'}`}>
                {report.status}
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-2">{report.description}</p>
            <div className="flex justify-between text-xs text-gray-400">
              <span>📁 {report.category}</span>
              <span>📍 {parseFloat(report.latitude).toFixed(4)}, {parseFloat(report.longitude).toFixed(4)}</span>
              <span>🕒 {new Date(report.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}