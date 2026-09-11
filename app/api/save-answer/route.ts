// app/api/save-answer/route.ts

import { NextResponse } from 'next/server'


export async function POST(request: Request) {

  return NextResponse.json(
    {
      success: false,
      message: 'save-answer endpoint not implemented'
    },
    {
      status: 501
    }
  )

}