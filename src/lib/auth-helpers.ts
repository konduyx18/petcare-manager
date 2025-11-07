import { supabase } from '@/lib/supabase'

interface AuthError {
  message: string
  code?: string
}

interface SignUpData {
  email: string
  fullName: string
}

// Generate random password for OTP-based signup (users never see this)
export function generateRandomPassword(): string {
  const length = 32
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

// Format OTP errors for user-friendly messages
export function formatOtpError(error: any): string {
  if (!error) return 'An unexpected error occurred'
  
  const message = error.message || ''
  
  if (message.includes('invalid') || message.includes('Invalid')) {
    return 'Invalid code. Please check and try again.'
  }
  if (message.includes('expired') || message.includes('Expired')) {
    return 'Code expired. Please request a new one.'
  }
  if (message.includes('rate_limit') || message.includes('rate limit')) {
    return 'Too many attempts. Please wait a few minutes.'
  }
  if (message.includes('network') || message.includes('Network')) {
    return 'Network error. Please try again.'
  }
  
  return 'Verification failed. Please try again.'
}

/**
 * Sign in with magic link
 * Sends a magic link to the user's email
 */
export async function signInWithMagicLink(email: string): Promise<{ error: AuthError | null }> {
  try {
    const redirectTo = `${window.location.origin}/auth/confirm`
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    })

    if (error) {
      return { error: formatAuthError(error) }
    }

    return { error: null }
  } catch (err) {
    return {
      error: {
        message: 'Network error. Please check your connection and try again.',
        code: 'network_error',
      },
    }
  }
}

/**
 * Sign up with magic link
 * Creates a new user account and profile
 */
export async function signUpWithMagicLink(data: SignUpData): Promise<{ error: AuthError | null }> {
  try {
    const redirectTo = `${window.location.origin}/auth/confirm`
    
    // Create the user account
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: crypto.randomUUID(), // Generate random password (not used with magic links)
      options: {
        emailRedirectTo: redirectTo,
        data: {
          full_name: data.fullName,
        },
      },
    })

    if (signUpError) {
      return { error: formatAuthError(signUpError) }
    }

    // Create profile record if user was created
    if (authData.user) {
      const profileData = {
        id: authData.user.id,
        full_name: data.fullName,
        email: data.email,
      }
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileData as any)

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Don't fail the signup if profile creation fails
        // The user can still sign in, and we can create the profile later
      }
    }

    return { error: null }
  } catch (err) {
    return {
      error: {
        message: 'Network error. Please check your connection and try again.',
        code: 'network_error',
      },
    }
  }
}

/**
 * Handle auth callback from magic link
 * Processes the token from URL hash
 */
export async function handleAuthCallback(): Promise<{
  success: boolean
  error: AuthError | null
}> {
  try {
    // Get the hash from the URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    const type = hashParams.get('type')

    if (!accessToken || type !== 'magiclink') {
      return {
        success: false,
        error: {
          message: 'Invalid or expired magic link. Please request a new one.',
          code: 'invalid_token',
        },
      }
    }

    // Set the session with the tokens
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || '',
    })

    if (error) {
      return {
        success: false,
        error: formatAuthError(error),
      }
    }

    return { success: true, error: null }
  } catch (err) {
    return {
      success: false,
      error: {
        message: 'Failed to verify magic link. Please try again.',
        code: 'verification_error',
      },
    }
  }
}

/**
 * Format Supabase auth errors into user-friendly messages
 */
function formatAuthError(error: any): AuthError {
  const message = error.message || 'An unexpected error occurred'
  const code = error.code || error.status || 'unknown'

  // Map common error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    'invalid_credentials': 'Invalid email or password',
    'email_not_confirmed': 'Please check your email to confirm your account',
    'user_already_exists': 'An account with this email already exists',
    'invalid_email': 'Please enter a valid email address',
    'weak_password': 'Password is too weak. Please use a stronger password',
    'over_email_send_rate_limit': 'Too many requests. Please wait a few minutes and try again',
    'email_address_invalid': 'Please enter a valid email address',
  }

  return {
    message: errorMessages[code] || message,
    code,
  }
}
