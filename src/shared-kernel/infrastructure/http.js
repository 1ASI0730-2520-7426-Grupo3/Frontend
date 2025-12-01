import axios from 'axios'
import i18n from './i18n'

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

    // Add Accept-Language header
    // Backend expects just "en" or "es" (not "en-US" or "es-ES")
    const currentLocale = i18n.global.locale.value
    config.headers['Accept-Language'] = currentLocale

    // Debug: Log the language being sent
    console.log(`🌐 Sending Accept-Language: ${currentLocale}`)

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

    // Debug: Log backend error response
    if (error.response?.data) {
      console.log('🔴 Backend error response:', error.response.data)
    }

    // Handle 401 Unauthorized (invalid/expired token)
    if (error.response?.status === 401) {
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('accessToken')
    }

    return Promise.reject(error)
  },
)
