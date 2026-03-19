import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8000/api'
})

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token')
  if (token) req.headers.Authorization = `Bearer ${token}`
  return req
})

export const login = (data) => API.post('/auth/login', data)
export const register = (data) => API.post('/auth/register', data)
export const submitReport = (data) => API.post('/reports', data)
export const getMyReports = () => API.get('/reports/my')
export const getAllReports = () => API.get('/reports')
export const updateStatus = (id, status) => API.patch(`/reports/${id}`, { status })