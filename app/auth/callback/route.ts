// app/auth/callback/route.ts

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'


export async function GET(request: Request) {

  const { searchParams } =
    new URL(request.url)

  const error =
    searchParams.get('error')

  const errorCode =
    searchParams.get('error_code')

  const code =
    searchParams.get('code')


  if (code) {

    const supabase =
      await createClient()


    const {
      error
    } =
      await supabase.auth.exchangeCodeForSession(
        code
      )


    if (error) {

      console.error(
        'Magic Link exchange failed:',
        error.message
      )

      return NextResponse.redirect(
        new URL(
          '/applicant/login?error=auth',
          request.url
        )
      )

    }

  }


  return NextResponse.redirect(
    new URL(
      '/applicant/dashboard',
      request.url
    )
  )

}