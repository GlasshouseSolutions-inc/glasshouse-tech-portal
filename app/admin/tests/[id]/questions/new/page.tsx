//app/admin/tests/[id]/questions/new/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AddQuestionPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string } // test id

  const [questions, setQuestions] = useState<any[]>([])
  const [selectedQuestion, setSelectedQuestion] = useState('')
  const [weight, setWeight] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadQuestions() {
      const { data, error } = await supabase
        .from('questions')
        .select('*')

      if (error) {
        alert(error.message)
        return
      }

      setQuestions(data || [])
      setLoading(false)
    }

    loadQuestions()
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedQuestion) {
      alert('Select a question')
      return
    }

    const { error } = await supabase.from('test_questions').insert([
      { test_id: id, question_id: selectedQuestion, weight }
    ])

    if (error) alert(error.message)
    else router.push(`/admin/tests/${id}/questions`)
  }

  if (loading) return <p>Loading available questions...</p>

  return (
    <div>
      <h1>Add Question to Test</h1>
      <form onSubmit={handleAdd}>
        <div>
          <label>Question</label>
          <select value={selectedQuestion} onChange={(e) => setSelectedQuestion(e.target.value)} required>
            <option value="">Select Question</option>
            {questions.map((q: any) => (
              <option key={q.id} value={q.id}>
                {q.question_text} ({q.question_type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Weight</label>
          <input type="number" value={weight} min={1} onChange={(e) => setWeight(Number(e.target.value))} />
        </div>

        <button type="submit" style={{ backgroundColor: '#FE5000', color: 'white', padding: '0.5rem 1rem', marginTop: '1rem' }}>
          Add Question
        </button>
      </form>
    </div>
  )
}