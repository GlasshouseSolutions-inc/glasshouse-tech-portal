import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const code = searchParams.get('code')
  const next = searchParams.get('next')

  const allowedDestinations = [
    '/applicant/dashboard',
    '/admin',
  ]

  const destination =
    next && allowedDestinations.includes(next)
      ? next
      : '/applicant/dashboard'

  const loginDestination =
    destination === '/admin'
      ? '/admin/login?error=auth'
      : '/applicant/login?error=auth'

  if (code) {
    const supabase = await createClient()

    const { error } =
      await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error(
        'Magic Link exchange failed:',
        error.message
      )

      return NextResponse.redirect(
        new URL(loginDestination, request.url)
      )
    }
  }

  return NextResponse.redirect(
    new URL(destination, request.url)
  )
}