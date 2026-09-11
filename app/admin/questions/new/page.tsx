// app/admin/questions/new/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function NewQuestionPage() {
  const router = useRouter()
  const [category, setCategory] = useState('Technical')
  const [questionType, setQuestionType] = useState('Multiple Choice')
  const [questionText, setQuestionText] = useState('')
  const [expectedAnswer, setExpectedAnswer] = useState('')
  const [loading, setLoading] = useState(false)

  const categories = ['Technical', 'Sales', 'Marketing', 'Operations', 'Leadership', 'Customer Service']
  const types = ['Multiple Choice', 'True/False', 'Short Answer', 'Scenario']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('questions').insert([
      { category, question_type: questionType, question_text: questionText, expected_answer: expectedAnswer }
    ])

    setLoading(false)
    if (error) {
      alert(error.message)
    } else {
      router.push('/admin/questions')
    }
  }

  return (
    <div>
      <h1>New Question</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label>Type</label>
          <select value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
            {types.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label>Question Text</label>
          <textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} />
        </div>

        <div>
          <label>Expected Answer</label>
          <textarea value={expectedAnswer} onChange={(e) => setExpectedAnswer(e.target.value)} />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Question'}
        </button>
      </form>
    </div>
  )
}