import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('faraja_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => {
    // Unwrap backend's { success, message, data: { ... } } so callers get data directly
    if (res.data && typeof res.data === 'object' && 'success' in res.data && 'data' in res.data) {
      res.data = res.data.data
    }
    return res
  },
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('faraja_token')
      localStorage.removeItem('faraja_user')
      window.dispatchEvent(new CustomEvent('auth:logout'))
    }
    return Promise.reject(err)
  }
)

export default api
