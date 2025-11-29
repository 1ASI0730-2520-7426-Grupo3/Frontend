import axios from 'axios'

export const http = axios.create({
  baseURL: 'http://localhost:5022/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
})

// Add request interceptor to include JWT token
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
      // Optionally redirect to login
      // window.location.href = '/login'
    }

    return Promise.reject(error)
  },
)
