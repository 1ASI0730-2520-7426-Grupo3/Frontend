import { http } from '@/shared-kernel/infrastructure/http'
import { AuthAssembler } from '../Domain/auth.assembler.js'

/**
 * Auth API Service
 * Handles authentication-related API calls
 */
export class AuthApiService {
  /**
   * Login user with credentials
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<User>} - Authenticated user entity
   */
  async login(email, password) {
    try {
      // For now, mock authentication
      // TODO: Replace with real API call when backend is ready , checkinggggg
      // const response = await http.post('/auth/login', { email, password })

      // Mock: Find user from users endpoint
      const response = await http.get('/users', {
        params: { email, password }
      })

      if (response.data && response.data.length > 0) {
        const userData = response.data[0]
        // Store authentication
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('userId', userData.id.toString())
        localStorage.setItem('userEmail', userData.email)

        // Return user entity
        return AuthAssembler.toEntityFromResource(userData)
      } else {
        throw new Error('Invalid credentials')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  /**
   * Logout current user
   */
  logout() {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userId')
    localStorage.removeItem('userEmail')
  }

  /**
   * Check if user is currently authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return localStorage.getItem('isAuthenticated') === 'true'
  }

  /**
   * Get current user ID
   * @returns {number|null}
   */
  getCurrentUserId() {
    const userId = localStorage.getItem('userId')
    return userId ? parseInt(userId, 10) : null
  }

  /**
   * Get current user data
   * @returns {Promise<User|null>}
   */
  async getCurrentUser() {
    try {
      const userId = this.getCurrentUserId()
      if (!userId) return null

      const response = await http.get(`/users/${userId}`)
      return AuthAssembler.toEntityFromResource(response.data)
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  /**
   * Register new user (for future implementation)
   * @param {Object} signupData - Signup form data
   * @returns {Promise<User>}
   */
  async signup(signupData) {
    try {
      const resource = AuthAssembler.toSignupResource(signupData)
      const response = await http.post('/users', resource)

      // Auto-login after signup
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userId', response.data.id.toString())
      localStorage.setItem('userEmail', response.data.email)

      return AuthAssembler.toEntityFromResource(response.data)
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }
}
