import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { submitReport } from '../../services/api'
import { useNavigate } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default marker icon bug in Leaflet + Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function LocationPicker({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng)
    }
  })
  return null
}

export default function SubmitReport() {
  const [form, setForm] = useState({ title: '', description: '', category: '' })
  const [position, setPosition] = useState(null)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!position) return alert('Please click on the map to select a location!')
    try {
      await submitReport({
        ...form,
        latitude: position.lat,
        longitude: position.lng
      })
      alert('Report submitted successfully!')
      navigate('/my-reports')
    } catch (err) {
      alert('Failed to submit report. Try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6">Report an Issue</h2>

        <form onSubmit={handleSubmit}>
          <input type="text" name="title" placeholder="Issue Title"
            className="w-full border p-2 rounded mb-4"
            onChange={handleChange} required />

          <select name="category"
            className="w-full border p-2 rounded mb-4"
            onChange={handleChange} required>
            <option value="">Select Category</option>
            <option value="pothole">Pothole</option>
            <option value="streetlight">Broken Streetlight</option>
            <option value="graffiti">Graffiti</option>
            <option value="dumping">Illegal Dumping</option>
            <option value="other">Other</option>
          </select>

          <textarea name="description" placeholder="Describe the issue..."
            className="w-full border p-2 rounded mb-4 h-24"
            onChange={handleChange} required />

          <p className="text-sm text-gray-500 mb-2">
            📍 Click on the map to pin the issue location
          </p>

          {/* MAP */}
          <div className="rounded overflow-hidden mb-4" style={{ height: '300px' }}>
            <MapContainer
              center={[41.3275, 19.8187]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© OpenStreetMap contributors'
              />
              <LocationPicker onSelect={setPosition} />
              {position && <Marker position={position} />}
            </MapContainer>
          </div>

          {position && (
            <p className="text-sm text-green-600 mb-4">
              ✅ Location selected: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
            </p>
          )}

          <button type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Submit Report
          </button>
        </form>
      </div>
    </div>
  )
}