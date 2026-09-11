// app/applicant/results/[id]/page.tsx

import { supabase } from '@/lib/supabase/client'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

interface TestResult {
  id: string
  applicant_id: string
  test_id: string
  attempt_id: string
  score: number
  pass_fail: string | null
  recommendation: string | null
  completed_at: string
}

interface Test {
  id: string
  name: string
  description: string | null
}

interface ApplicantAnswer {
  id: string
  question_id: string
  answer_text: string
}

interface Question {
  id: string
  question_text: string
  expected_answer: string | null
}

export default async function ResultsPage({
  params,
}: PageProps) {
  const { id } = await params

  const { data: result, error: resultError } =
    await supabase
      .from('test_results')
      .select('*')
      .eq('id', id)
      .single()

  if (resultError || !result) {
    console.error(resultError)

    return (
      <div>
        <h1>Results</h1>
        <p>No test result found.</p>
      </div>
    )
  }

  const typedResult = result as TestResult

  const { data: test } = await supabase
    .from('tests')
    .select('id, name, description')
    .eq('id', typedResult.test_id)
    .single()

  const { data: answers, error: answersError } =
    await supabase
      .from('applicant_answers')
      .select('id, question_id, answer_text')
      .eq('attempt_id', typedResult.attempt_id)

  if (answersError) {
    console.error(answersError)
  }

  const questionIds =
    answers?.map(
      (answer) => answer.question_id
    ) ?? []

  const { data: questions } =
    await supabase
      .from('questions')
      .select(
        'id, question_text, expected_answer'
      )
      .in('id', questionIds)

  const questionMap = new Map(
    (questions ?? []).map((question) => [
      question.id,
      question,
    ])
  )

  return (
    <div>
      <h1>Results</h1>

      <h2>
        {(test as Test | null)?.name ??
          'Test'}
      </h2>

      <p>
        Score: {typedResult.score}%
      </p>

      <p>
        Result:{' '}
        <strong>
          {typedResult.pass_fail ?? 'Pending'}
        </strong>
      </p>

      <p>
        Completed:{' '}
        {new Date(
          typedResult.completed_at
        ).toLocaleString()}
      </p>

      <hr />

      <h2>Answers</h2>

      {answers?.map((answer) => {
        const question =
          questionMap.get(
            answer.question_id
          )

        return (
          <div
            key={answer.id}
            style={{
              marginBottom: '2rem',
            }}
          >
            <p>
              <strong>
                {question?.question_text}
              </strong>
            </p>

            <p>
              Your answer:{' '}
              {answer.answer_text}
            </p>

            <p>
              Correct answer:{' '}
              {question?.expected_answer}
            </p>
          </div>
        )
      })}
    </div>
  )
}