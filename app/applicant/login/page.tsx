// app/applicant/login/page.tsx

'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function ApplicantLoginPage() {

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)


  async function handleLogin(e: React.FormEvent) {

    e.preventDefault()

    console.log('Magic Link submit started')

    setLoading(true)


    const { error } =
      await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            `${window.location.origin}/auth/callback`
        }
      })

    console.log('Magic Link submit returned', { error })

    if (error) {

      alert(error.message)

    } else {

      alert(
        'Check your email for the login link.'
      )

    }


    setLoading(false)

  }



  return (

    <div className="page-container max-w-md">

      <h1>
        Applicant Login
      </h1>


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
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
        />


        <button
          className="btn-primary"
          type="submit"
          disabled={loading}
        >

          {loading
            ? 'Sending...'
            : 'Send Magic Link'
          }

        </button>


      </form>


    </div>

  )

}