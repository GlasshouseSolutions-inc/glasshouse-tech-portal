// app/api/submit-answer/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'


export async function POST(
  req: NextRequest
) {

  const supabase =
    createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )


  try {

    const body =
      await req.json()


    const {
      applicant_id,
      test_id,
      answers
    } = body



    if (
      !applicant_id ||
      !test_id ||
      !answers ||
      !Array.isArray(answers)
    ) {

      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request payload'
        },
        {
          status: 400
        }
      )

    }



    const rows =
      answers.map(
        (answer: any) => ({
          applicant_id,
          test_id,
          question_id:
            answer.question_id,
          answer_text:
            answer.answer_text
        })
      )



    const {
      error
    } = await supabase
      .from('applicant_answers')
      .insert(rows)



    if (error) {

      console.error(
        'Error saving answers:',
        error
      )


      return NextResponse.json(
        {
          success: false,
          message: error.message
        },
        {
          status: 500
        }
      )

    }



    return NextResponse.json(
      {
        success: true
      }
    )


  } catch (error) {

    console.error(
      'Submit answer error:',
      error
    )


    return NextResponse.json(
      {
        success: false,
        message: 'Server error'
      },
      {
        status: 500
      }
    )

  }

}