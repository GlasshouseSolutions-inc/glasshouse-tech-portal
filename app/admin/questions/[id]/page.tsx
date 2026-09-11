// app/admin/questions/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function EditQuestionPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id

  const [question, setQuestion] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const categories = ['Technical', 'Sales', 'Marketing', 'Operations', 'Leadership', 'Customer Service']
  const types = ['Multiple Choice', 'True/False', 'Short Answer', 'Scenario']

  useEffect(() => {
    const fetchQuestion = async () => {
      const { data, error } = await supabase.from('questions').select('*').eq('id', id).single()
      if (error) {
        alert(error.message)
        router.push('/admin/questions')
      } else {
        setQuestion(data)
      }
      setLoading(false)
    }
    fetchQuestion()
  }, [id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('questions').update({
      category: question.category,
      question_type: question.question_type,
      question_text: question.question_text,
      expected_answer: question.expected_answer
    }).eq('id', id)
    setSaving(false)
    if (error) {
      alert(error.message)
    } else {
      router.push('/admin/questions')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this question?')) return
    const { error } = await supabase.from('questions').delete().eq('id', id)
    if (error) {
      alert(error.message)
    } else {
      router.push('/admin/questions')
    }
  }

  if (loading) return <p>Loading...</p>
  if (!question) return <p>Question not found.</p>

  return (
    <div>
      <h1>Edit Question</h1>
      <form onSubmit={handleSave}>
        <div>
          <label>Category</label>
          <select value={question.category} onChange={(e) => setQuestion({ ...question, category: e.target.value })}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label>Type</label>
          <select value={question.question_type} onChange={(e) => setQuestion({ ...question, question_type: e.target.value })}>
            {types.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label>Question Text</label>
          <textarea value={question.question_text} onChange={(e) => setQuestion({ ...question, question_text: e.target.value })} />
        </div>

        <div>
          <label>Expected Answer</label>
          <textarea value={question.expected_answer} onChange={(e) => setQuestion({ ...question, expected_answer: e.target.value })} />
        </div>

        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        <button type="button" onClick={handleDelete} style={{ marginLeft: '1rem', color: 'red' }}>Delete Question</button>
      </form>
    </div>
  )
}