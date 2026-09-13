//app/admin/results/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function POST(req: NextRequest) {
  try {
    const { applicant_id, test_id } = await req.json()

    if (!applicant_id || !test_id) {
      return NextResponse.json(
        { error: 'Missing applicant_id or test_id' },
        { status: 400 }
      )
    }

    // Fetch all questions for the test
    const { data: testQuestions, error: tqError } = await supabase
      .from('test_questions')
      .select('question_id, weight')
      .eq('test_id', test_id)

    if (tqError) throw tqError
    if (!testQuestions || testQuestions.length === 0)
      throw new Error('No questions in this test')

    // Fetch applicant answers for this test
    const { data: answers, error: ansError } = await supabase
      .from('applicant_answers')
      .select('question_id, answer_text')
      .eq('applicant_id', applicant_id)
      .in(
        'question_id',
        testQuestions.map((q) => q.question_id)
      )

    if (ansError) throw ansError

    // Calculate score
    let totalWeight = 0
    let correctWeight = 0

    for (const tq of testQuestions) {
      totalWeight += tq.weight || 1
      const ans = answers?.find(
        (a) => a.question_id === tq.question_id
      )
      // MVP: compare text directly with expected_answer
      const { data: qData, error: qErr } = await supabase
        .from('questions')
        .select('expected_answer')
        .eq('id', tq.question_id)
        .single()
      if (qErr) continue
      if (ans?.answer_text?.trim().toLowerCase() === qData.expected_answer?.trim().toLowerCase()) {
        correctWeight += tq.weight || 1
      }
    }

    const score = Math.round((correctWeight / totalWeight) * 100)

    // Determine recommendation
    let recommendation = ''
    if (score >= 80) recommendation = 'Hire'
    else if (score >= 50) recommendation = 'Review'
    else recommendation = 'Reject'

    // Insert into test_results
    const { error: insertError } = await supabase.from('test_results').insert([
      {
        applicant_id,
        test_id,
        score,
        recommendation,
        completed_at: new Date().toISOString()
      }
    ])

    if (insertError) throw insertError

    return NextResponse.json({
      success: true,
      score,
      recommendation
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err.message || 'Internal error' },
      { status: 500 }
    )
  }
}