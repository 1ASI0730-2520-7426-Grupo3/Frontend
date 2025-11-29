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
      const response = await http.post('/users/login', {
        email,
        password,
      })

      // Backend returns: { user: {...}, accessToken: "...", expiresAt: "..." }
      const { user, accessToken } = response.data

      // Store authentication with JWT token
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userId', user.id.toString())
      localStorage.setItem('userEmail', user.email)
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('userRole', user.role.toLowerCase())

      // Return user entity
      return AuthAssembler.toEntityFromResource(user)
    } catch (error) {
      console.error('Login error:', error)
      throw new Error('Invalid credentials')
    }
  }

  /**
   * Logout current user
   */
  logout() {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userId')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userRole')
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
   * Get stored access token
   * @returns {string|null}
   */
  getAccessToken() {
    return localStorage.getItem('accessToken')
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
   * Register new user
   * @param {Object} signupData - Signup form data
   * @returns {Promise<User>}
   */
  async signup(signupData) {
    try {
      const resource = AuthAssembler.toSignupResource(signupData)
      const response = await http.post('/users/register', resource)

      // Backend returns user resource (no auto-login)
      return AuthAssembler.toEntityFromResource(response.data)
    } catch (error) {
      console.error('Signup error:', error)
      // Handle backend validation errors
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Registration failed. Please try again.')
    }
  }
}
