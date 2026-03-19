import { useEffect, useState } from 'react'
import { getAllReports, updateStatus } from '../../services/api'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const statusColors = {
  submitted: 'bg-gray-200 text-gray-700',
  'under review': 'bg-yellow-100 text-yellow-700',
  'in progress': 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
}

const departments = ['Roads', 'Electricity', 'Sanitation', 'Parks', 'Other']
const statuses = ['submitted', 'under review', 'in progress', 'resolved']

export default function Dashboard() {
  const [reports, setReports] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [view, setView] = useState('list') // 'list' or 'map'
  const navigate = useNavigate()

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await getAllReports()
        setReports(res.data)
        setFiltered(res.data)
      } catch (err) {
        alert('Failed to load reports.')
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  useEffect(() => {
    let result = reports
    if (filterStatus !== 'all') result = result.filter(r => r.status === filterStatus)
    if (filterCategory !== 'all') result = result.filter(r => r.category === filterCategory)
    setFiltered(result)
  }, [filterStatus, filterCategory, reports])

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateStatus(id, newStatus)
      setReports(reports.map(r => r.id === id ? { ...r, status: newStatus } : r))
    } catch (err) {
      alert('Failed to update status.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">🏛️ Staff Dashboard</h1>
        <div className="flex gap-3">
          <button onClick={() => setView('list')}
            className={`px-4 py-1 rounded text-sm ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
            List
          </button>
          <button onClick={() => setView('map')}
            className={`px-4 py-1 rounded text-sm ${view === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
            Map
          </button>
          <button onClick={() => { localStorage.clear(); navigate('/') }}
            className="px-4 py-1 rounded text-sm bg-red-100 text-red-600 hover:bg-red-200">
            Logout
          </button>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {statuses.map(s => (
            <div key={s} className="bg-white rounded-xl shadow p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {reports.filter(r => r.status === s).length}
              </div>
              <div className="text-xs text-gray-500 capitalize mt-1">{s}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <select className="border p-2 rounded text-sm"
            onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="border p-2 rounded text-sm"
            onChange={e => setFilterCategory(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="pothole">Pothole</option>
            <option value="streetlight">Broken Streetlight</option>
            <option value="graffiti">Graffiti</option>
            <option value="dumping">Illegal Dumping</option>
            <option value="other">Other</option>
          </select>
          <span className="text-sm text-gray-500 self-center">
            {filtered.length} report{filtered.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {/* LIST VIEW */}
        {view === 'list' && (
          <div>
            {loading && <p className="text-center text-gray-500">Loading reports...</p>}
            {!loading && filtered.length === 0 && (
              <p className="text-center text-gray-400 mt-10">No reports match your filters.</p>
            )}
            {!loading && filtered.map(report => (
              <div key={report.id} className="bg-white rounded-xl shadow p-6 mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{report.title}</h3>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[report.status] || 'bg-gray-100'}`}>
                    {report.status}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-3">{report.description}</p>
                <div className="flex justify-between text-xs text-gray-400 mb-4">
                  <span>📁 {report.category}</span>
                  <span>📍 {parseFloat(report.latitude).toFixed(4)}, {parseFloat(report.longitude).toFixed(4)}</span>
                  <span>🕒 {new Date(report.created_at).toLocaleDateString()}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-3 flex-wrap">
                  <select
                    defaultValue={report.status}
                    onChange={e => handleStatusUpdate(report.id, e.target.value)}
                    className="border p-1 rounded text-sm">
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select className="border p-1 rounded text-sm">
                    <option value="">Assign Department</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MAP VIEW */}
        {view === 'map' && (
          <div className="rounded-xl overflow-hidden shadow" style={{ height: '500px' }}>
            <MapContainer center={[41.3275, 19.8187]} zoom={13}
              style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© OpenStreetMap contributors' />
              {filtered.map(report => (
                report.latitude && report.longitude && (
                  <Marker key={report.id}
                    position={[parseFloat(report.latitude), parseFloat(report.longitude)]}>
                    <Popup>
                      <strong>{report.title}</strong><br />
                      {report.category}<br />
                      <span className="capitalize">{report.status}</span>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  )
}