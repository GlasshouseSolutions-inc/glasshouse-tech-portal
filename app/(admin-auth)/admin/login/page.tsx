'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          `${window.location.origin}/auth/callback?next=/admin`,
      },
    })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    setMagicLinkSent(true)
    setLoading(false)
  }

  if (magicLinkSent) {
    return (
      <div className="page-container max-w-md">
        <h1>Admin Magic Link Sent</h1>

        <p>
          A secure administrative login link has been sent to:
        </p>

        <p>
          <strong>{email}</strong>
        </p>

        <p>To access the Glasshouse Admin Portal:</p>

        <ol>
          <li>
            Keep using this same device and browser profile.
          </li>

          <li>
            Open your email in this same browser profile.
          </li>

          <li>
            Find the Magic Link email from Glasshouse Solutions.
          </li>

          <li>
            Click the login link.
          </li>

          <li>
            After authentication, you will be redirected to the Admin Portal.
          </li>
        </ol>

        <p>
          <strong>Important:</strong>{' '}
          Only accounts that have been authorized as Admin users will be
          permitted to access the Admin Portal.
        </p>

        <button
          className="btn-primary"
          type="button"
          onClick={() => setMagicLinkSent(false)}
        >
          Request Another Magic Link
        </button>
      </div>
    )
  }

  return (
    <div className="page-container max-w-md">
      <h1>Admin Login</h1>

      <form
        onSubmit={handleLogin}
        className="form-group"
      >
        <label>
          Email
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          className="btn-primary"
          type="submit"
          disabled={loading}
        >
          {loading
            ? 'Sending...'
            : 'Send Admin Magic Link'}
        </button>
      </form>

      <div className="login-instructions">
        <h2>Administrative Access</h2>

        <p>
          Use an email address associated with an authorized Glasshouse
          administrative account.
        </p>

        <p>
          Authentication alone does not grant Admin Portal access.
          Your account must also have the Admin role assigned.
        </p>
      </div>
    </div>
  )
}