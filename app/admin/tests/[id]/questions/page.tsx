//app/admin/tests/[id]/questions/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

type Question = {
  id: string
  question_text: string
  question_type: string
}

type TestQuestion = {
  id: string
  question_id: string
  weight: number
  question: Question | null
}

export default function TestQuestionsPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const [loading, setLoading] = useState(true)
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([])

  async function loadQuestions() {
    setLoading(true)

    const { data, error } = await supabase
      .from('test_questions')
      .select(`
        id,
        question_id,
        weight,
        question:questions (
          id,
          question_text,
          question_type
        )
      `)
      .eq('test_id', id)

    if (error) {
      console.error(error)
      alert(error.message)
      setLoading(false)
      return
    }

    setTestQuestions((data as unknown as TestQuestion[]) ?? [])

    setLoading(false)
  }

  useEffect(() => {
    loadQuestions()
  }, [id])

  async function handleDelete(testQuestionId: string) {
    const confirmed = confirm(
      'Remove this question from the test?'
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('test_questions')
      .delete()
      .eq('id', testQuestionId)

    if (error) {
      alert(error.message)
      return
    }

    await loadQuestions()
  }

  if (loading) {
    return <p>Loading questions...</p>
  }

  return (
    <div>
      <h1>Test Questions</h1>

      <button
        onClick={() =>
          router.push(
            `/admin/tests/${id}/questions/new`
          )
        }
      >
        + Add Question
      </button>

      {testQuestions.length === 0 ? (
        <p>No questions have been added to this test.</p>
      ) : (
        <table
          style={{
            width: '100%',
            marginTop: '1rem',
            borderCollapse: 'collapse'
          }}
        >
          <thead>
            <tr>
              <th>Question</th>
              <th>Type</th>
              <th>Weight</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {testQuestions.map((tq) => (
              <tr
                key={tq.id}
                style={{
                  borderBottom: '1px solid #ddd'
                }}
              >
                <td>
                  {tq.question?.question_text ??
                    'Question Missing'}
                </td>

                <td>
                  {tq.question?.question_type ??
                    '-'}
                </td>

                <td>{tq.weight}</td>

                <td>
                  <button
                    onClick={() =>
                      handleDelete(tq.id)
                    }
                    style={{
                      color: 'red'
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}