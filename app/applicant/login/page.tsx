// app/applicant/login/page.tsx

'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function ApplicantLoginPage() {

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] =
    useState(false)


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

    console.log(
      'Magic Link submit returned',
      { error }
    )


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

        <h1>
          Magic Link Sent
        </h1>


        <p>
          A secure login link has been sent to:
        </p>


        <p>
          <strong>
            {email}
          </strong>
        </p>


        <p>
          To access your Applicant Dashboard:
        </p>


        <ol>
          <li>
            Keep using this same device and
            the same browser profile that
            you used to request the Magic Link.
          </li>

          <li>
            Open your email using this same
            browser profile.
          </li>

          <li>
            Find the Magic Link email from
            Glasshouse Solutions.
          </li>

          <li>
            Click the login link in the email.
          </li>

          <li>
            The link will securely sign you in
            and take you to your Applicant
            Dashboard.
          </li>
        </ol>


        <p>
          <strong>
            Important:
          </strong>{' '}
          Do not open the Magic Link on another
          device, in another browser, or in a
          different browser profile. Doing so
          may prevent the login from completing.
        </p>


        <p>
          If you requested more than one Magic
          Link, use the most recently received
          email.
        </p>


        <button
          className="btn-primary"
          type="button"
          onClick={() =>
            setMagicLinkSent(false)
          }
        >
          Request Another Magic Link
        </button>

      </div>

    )

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