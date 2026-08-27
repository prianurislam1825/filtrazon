'use client'

import { useState, useTransition } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, AlertTriangle, Loader2 } from 'lucide-react'

// This component calls useSearchParams() and MUST be wrapped in <Suspense> by its parent
export default function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl  = searchParams.get('callbackUrl') ?? '/dashboard'

  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [showPw,     setShowPw]     = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [attempts,   setAttempts]   = useState(0)
  const [isPending,  startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setAttempts(a => a + 1)
        setError(
          result.error === 'CredentialsSignin'
            ? 'Email or password is incorrect.'
            : 'Login failed. Please try again.',
        )
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    })
  }

  const maxAttempts  = 5
  const showRateHint = attempts >= 3

  return (
    <div className="card p-7 shadow-lg">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#15324A]">Sign in</h2>
        <p className="text-sm text-gray-400 mt-1">Access your monitoring dashboard</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-gray-600 mb-1.5">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="admin@filtrazon.local"
            disabled={isPending}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-300
              focus:outline-none focus:ring-2 focus:ring-[#5BBCEB] focus:border-transparent
              disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-gray-600 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isPending}
              className="w-full px-3 py-2.5 pr-10 text-sm rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-300
                focus:outline-none focus:ring-2 focus:ring-[#5BBCEB] focus:border-transparent
                disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPw(s => !s)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus-visible:outline-none"
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div role="alert" className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
            <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {/* Rate limit hint */}
        {showRateHint && !error && (
          <p className="text-[11px] text-gray-400 text-center">
            {maxAttempts - attempts} attempt{maxAttempts - attempts !== 1 ? 's' : ''} remaining before temporary lockout.
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending || !email || !password}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold
            bg-[#0B3B66] text-white
            hover:bg-[#1268A5] active:bg-[#0B3B66]
            disabled:opacity-50 disabled:cursor-not-allowed
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BBCEB] focus-visible:ring-offset-2
            transition-colors"
        >
          {isPending
            ? <><Loader2 size={15} className="animate-spin" aria-hidden="true" /> Signing in...</>
            : 'Sign in to Dashboard'}
        </button>
      </form>

      <p className="mt-5 text-center text-[11px] text-gray-400 leading-relaxed">
        Access restricted to authorized personnel only.<br />
        Contact system administrator for credentials.
      </p>
    </div>
  )
}
