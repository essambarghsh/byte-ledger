import bcrypt from 'bcryptjs'

/**
 * Hash a password using bcrypt
 * @param password - The plain text password to hash
 * @returns Promise<string> - The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12 // Higher salt rounds for better security
  return bcrypt.hash(password, saltRounds)
}

/**
 * Verify a password against a hash
 * @param password - The plain text password to verify
 * @param hash - The hashed password to compare against
 * @returns Promise<boolean> - True if password matches the hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Validate password strength
 * @param password - The password to validate
 * @returns { isValid: boolean, errors: string[] }
 */
export function validatePassword(password: string): { isValid: boolean, errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 6) {
    errors.push('يجب أن تكون كلمة المرور 6 أحرف على الأقل')
  }
  
  if (password.length > 128) {
    errors.push('كلمة المرور طويلة جداً')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
