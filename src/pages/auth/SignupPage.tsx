import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import * as z from 'zod'
import { Link } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'
import { generateRandomPassword, formatOtpError } from '@/lib/auth-helpers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { OtpInput } from '@/components/auth/OtpInput'
import { toast } from 'sonner'
import { Loader2, Mail, User, CheckCircle2, Shield, ArrowLeft } from 'lucide-react'

const signupSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .refine(
      (email) => {
        // More permissive regex that allows +, -, _, and other valid email characters
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
        return emailRegex.test(email)
      },
      'Please enter a valid email address'
    ),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
})

type SignupFormData = z.infer<typeof signupSchema>
type FormState = 'email-entry' | 'awaiting-otp' | 'verifying' | 'success'

export default function SignupPage() {
  const navigate = useNavigate()
  const [formState, setFormState] = useState<FormState>('email-entry')
  const [otpCode, setOtpCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId] = useState('')

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      fullName: '',
    },
  })

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    
    try {
      // Sign up with random password (user never sees this)
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: generateRandomPassword(),
        options: {
          data: {
            full_name: data.fullName,
          },
          emailRedirectTo: undefined, // No redirect, we use OTP
        },
      })

      if (error) throw error
      if (!authData.user) throw new Error('Failed to create account')

      setUserEmail(data.email)
      setUserId(authData.user.id)
      setFormState('awaiting-otp')
      setResendCooldown(60)
      toast.success('Check your email for an 8-digit code!')
    } catch (error: any) {
      console.error('Signup error:', error)
      toast.error(error.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOtp = async () => {
    if (otpCode.length !== 8) {
      toast.error('Please enter all 8 digits')
      return
    }

    setIsLoading(true)
    setFormState('verifying')

    try {
      // Verify OTP
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: userEmail,
        token: otpCode,
        type: 'signup',
      })

      if (verifyError) throw verifyError

      // Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: form.getValues('fullName'),
          email: userEmail,
        } as any)

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Don't fail if profile already exists
        if (!profileError.message.includes('duplicate')) {
          throw profileError
        }
      }

      setFormState('success')
      toast.success('Account verified successfully!')

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate({ to: '/dashboard' })
      }, 2000)
    } catch (error: any) {
      console.error('OTP verification error:', error)
      toast.error(formatOtpError(error))
      setFormState('awaiting-otp')
      setOtpCode('')
    } finally {
      setIsLoading(false)
    }
  }

  const resendCode = async () => {
    if (resendCooldown > 0) return

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: userEmail,
        options: {
          shouldCreateUser: false,
        },
      })

      if (error) throw error

      setResendCooldown(60)
      toast.success('New code sent to your email!')
    } catch (error: any) {
      console.error('Resend error:', error)
      toast.error(formatOtpError(error))
    } finally {
      setIsLoading(false)
    }
  }

  const changeEmail = () => {
    setFormState('email-entry')
    setOtpCode('')
    setUserEmail('')
    setUserId('')
  }

  // Success state
  if (formState === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-teal-400 to-blue-500 flex items-center justify-center p-4">
        <Card className="max-w-md w-full animate-slide-up">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Success!</CardTitle>
            <CardDescription className="text-base">
              Your account has been verified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800">
                Redirecting to your dashboard...
              </p>
            </div>
            <div className="flex justify-center">
              <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // OTP input state
  if (formState === 'awaiting-otp' || formState === 'verifying') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-teal-400 to-blue-500 flex items-center justify-center p-4">
        <Card className="max-w-md w-full animate-slide-up">
          <CardHeader className="text-center">
            <div className="text-5xl mb-2">📧</div>
            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
            <CardDescription className="text-base">
              We sent an 8-digit code to <strong>{userEmail}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Enter verification code
              </label>
              <OtpInput
                value={otpCode}
                onChange={setOtpCode}
                onComplete={verifyOtp}
                length={8}
              />
            </div>

            <Button
              onClick={verifyOtp}
              disabled={otpCode.length !== 8 || isLoading}
              className="w-full bg-green-600 hover:bg-green-700 font-bold py-3"
            >
              {formState === 'verifying' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>

            <div className="space-y-3 text-center text-sm">
              <div>
                {resendCooldown > 0 ? (
                  <span className="text-gray-500">
                    Resend code ({resendCooldown}s)
                  </span>
                ) : (
                  <button
                    onClick={resendCode}
                    disabled={isLoading}
                    className="text-green-600 hover:underline font-medium"
                  >
                    Resend code
                  </button>
                )}
              </div>
              <div>
                <button
                  onClick={changeEmail}
                  disabled={isLoading}
                  className="text-gray-600 hover:underline flex items-center gap-1 mx-auto"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Change email
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
              <p className="font-medium mb-1">💡 Tip:</p>
              <p>Check your spam folder if you don't see the email within a few minutes.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Email entry form
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-teal-400 to-blue-500 flex items-center justify-center p-4">
      <Card className="max-w-md w-full animate-slide-up">
        <CardHeader className="text-center">
          <div className="text-5xl mb-2">🐾</div>
          <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
          <CardDescription className="text-base">
            Join PetCare Manager today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 text-sm">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-green-800">
                <strong>No password needed!</strong> We'll send you a 6-digit code to verify your email.
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          {...field}
                          type="text"
                          placeholder="John Doe"
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          {...field}
                          type="text"
                          inputMode="email"
                          placeholder="you@example.com"
                          className="pl-10"
                          disabled={isLoading}
                          autoComplete="email"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-green-600 hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
