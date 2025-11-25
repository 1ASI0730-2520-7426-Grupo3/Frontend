import { User } from './user.entity.js'

/**
 * Auth Assembler
 * Transforms data between API responses and Domain entities
 */
export class AuthAssembler {
  /**
   * Convert API user resource to User entity
   * @param {Object} resource - Raw user data from API
   * @returns {User}
   */
  static toEntityFromResource(resource) {
    return new User(resource)
  }

  /**
   * Create login credentials resource
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} - Login credentials
   */
  static toLoginResource(email, password) {
    return {
      email,
      password,
    }
  }

  /**
   * Create signup resource from form data
   * @param {Object} formData - Signup form data
   * @returns {Object} - Signup resource
   */
  static toSignupResource(formData) {
    return {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      name: formData.name,
      phone: formData.phone || '',
      type: formData.type || 'individual',
    }
  }
}
