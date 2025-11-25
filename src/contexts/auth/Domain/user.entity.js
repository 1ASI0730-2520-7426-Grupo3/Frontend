/**
 * User Entity
 * Represents an authenticated user in the domain
 */
export class User {
  constructor({
    id = 0,
    username = '',
    email = '',
    password = '',
    name = '',
    phone = '',
    type = 'individual',
  }) {
    this.id = id
    this.username = username
    this.email = email
    this.password = password
    this.name = name
    this.phone = phone
    this.type = type
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return Boolean(this.id && this.username)
  }

  /**
   * Get display name
   * @returns {string}
   */
  getDisplayName() {
    return this.name || this.username || this.email
  }

  /**
   * Check if user is individual type
   * @returns {boolean}
   */
  isIndividual() {
    return this.type === 'individual'
  }

  /**
   * Check if user is company type
   * @returns {boolean}
   */
  isCompany() {
    return this.type === 'company'
  }
}
