'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'

export default function TestPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  const [questions, setQuestions] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  // Load user + questions + saved answers
  useEffect(() => {
    const loadUserAndData = async () => {
      // 1. Get authenticated user
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        window.location.href = '/login'
        return
      }

      setUserId(session.user.id)

      // 2. Load questions
      const { data: q } = await supabase
        .from('questions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      setQuestions(q || [])

      // 3. Load saved answers
      const { data: a } = await supabase
        .from('applicant_answers')
        .select('*')
        .eq('applicant_id', session.user.id)

      if (a) {
        const map: Record<string, string> = {}
        a.forEach((row) => {
          map[row.question_id] = row.answer
        })
        setAnswers(map)
      }

      setLoadingUser(false)
    }

    loadUserAndData()
  }, [])

  // Block UI until user + questions load
  if (loadingUser) {
    return <p className="p-6">Loading…</p>
  }

  if (questions.length === 0) {
    return <p className="p-6">Loading questions…</p>
  }

  const q = questions[currentIndex]

  const handleAnswer = async (letter: string) => {
    if (!userId) return

    setSaving(true)

    setAnswers((prev) => ({
      ...prev,
      [q.id]: letter,
    }))

    await supabase.from('applicant_answers').upsert({
      applicant_id: userId,
      question_id: q.id,
      answer: letter,
    })

    setSaving(false)
  }

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const submitTest = async () => {
    if (!userId) return

    const { data: saved } = await supabase
      .from('applicant_answers')
      .select('*')
      .eq('applicant_id', userId)

    let score = 0

    questions.forEach((question) => {
      const row = saved?.find((a) => a.question_id === question.id)
      if (row && row.answer === question.correct_answer) {
        score++
      }
    })

    await supabase.from('test_results').insert({
      applicant_id: userId,
      score,
      total_questions: questions.length,
      completed_at: new Date(),
    })

    window.location.href = '/thank-you'
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Applicant Test</h1>

      <p className="text-gray-600 mb-2">
        Question {currentIndex + 1} of {questions.length}
      </p>

      <div className="mb-6">
        <p className="text-lg font-medium mb-4">{q.question_text}</p>

        {['A', 'B', 'C', 'D'].map((letter) => {
          const choice = q[`choice_${letter.toLowerCase()}`]
          if (!choice) return null

          const selected = answers[q.id] === letter

          return (
            <button
              key={letter}
              onClick={() => handleAnswer(letter)}
              className={`block w-full text-left p-3 mb-3 border rounded 
                ${selected ? 'bg-blue-600 text-white' : 'bg-white text-black'}
              `}
            >
              <strong>{letter}.</strong> {choice}
            </button>
          )
        })}
      </div>

      {saving && <p className="text-yellow-600 mb-4">Saving…</p>}
      {!saving && answers[q.id] && (
        <p className="text-green-600 mb-4">Saved</p>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={goBack}
          disabled={currentIndex === 0}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Back
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={goNext}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Next
          </button>
        ) : (
          <button
            onClick={submitTest}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Submit Test
          </button>
        )}
      </div>
    </div>
  )
}
