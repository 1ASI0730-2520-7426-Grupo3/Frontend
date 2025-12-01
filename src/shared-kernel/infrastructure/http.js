import axios from 'axios'

export const http = axios.create({
  baseURL: 'https://app-coolgym-2025-02-b3g0b5f4gyghhhbh.chilecentral-01.azurewebsites.net/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
})

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

http.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error HTTP:', error.message)

    // Handle 401 Unauthorized (invalid/expired token)
    if (error.response?.status === 401) {
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('accessToken')
    }

    return Promise.reject(error)
  },
)
