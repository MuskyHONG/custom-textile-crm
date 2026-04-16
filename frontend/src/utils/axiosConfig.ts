import axios from 'axios'

interface ImportMetaEnv {
  readonly VITE_APP_API_URL?: string
}

const apiUrl = (import.meta as { env?: ImportMetaEnv }).env?.VITE_APP_API_URL || '/api'

const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
