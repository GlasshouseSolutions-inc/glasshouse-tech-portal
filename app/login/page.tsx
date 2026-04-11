'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Determine origin safely (works in SSR + browser)
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || 'https://glasshouse-tech-portal.vercel.app'

    const redirectTo = `${origin}/test`

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo
      }
    })

    if (error) {
      console.error(error)
      setMessage('Error sending magic link.')
    } else {
      setMessage('Magic link sent! Check your email.')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Applicant Login</h1>

      <form onSubmit={handleLogin} className="w-full max-w-sm">
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-3 border rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded"
        >
          Send Magic Link
        </button>
      </form>

      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  )
}
