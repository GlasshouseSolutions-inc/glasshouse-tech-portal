'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TestPage() {
  const [questions, setQuestions] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  // Load user, questions, and saved answers
  useEffect(() => {
    const loadData = async () => {
      // 1. Get authenticated user
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        // No session → send to login
        window.location.href = '/login'
        return
      }

      setUserId(user.id)

      // 2. Load questions
      const { data: qData, error: qError } = await supabase
        .from('questions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (qError) {
        console.error('Error loading questions:', qError)
      } else {
        setQuestions(qData)
      }

      // 3. Load saved answers
      const { data: saved } = await supabase
        .from('applicant_answers')
        .select('*')
        .eq('applicant_id', user.id)

      const restored: Record<string, string> = {}
      saved?.forEach((row) => {
        restored[row.question_id] = row.answer
      })

      setAnswers(restored)
      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) return <div className="p-6">Loading questions…</div>
  if (!userId) return <div className="p-6">Loading user…</div>
  if (!questions.length) return <div className="p-6">No questions found.</div>

  const q = questions[currentIndex]

  // AUTOSAVE ANSWER
  const handleAnswer = async (choice: string) => {
    setAnswers((prev) => ({
      ...prev,
      [q.id]: choice
    }))

    if (!userId) return

    const { error } = await supabase.from('applicant_answers').upsert(
      {
        applicant_id: userId,
        question_id: q.id,
        answer: choice
      },
      { onConflict: 'applicant_id,question_id' }
    )

    if (error) {
      console.error('Error saving answer:', error)
    }
  }

  const next = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const back = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Technician Test</h1>

      <p className="text-gray-600 mb-2">
        Question {currentIndex + 1} of {questions.length}
      </p>

      <div className="mb-6">
        <p className="text-lg font-semibold mb-4">{q.question_text}</p>

        <div className="space-y-2">
          {['A', 'B', 'C', 'D'].map((letter) => {
            const choice = q[`choice_${letter.toLowerCase()}`]
            if (!choice) return null

            return (
              <button
                key={letter}
                onClick={() => handleAnswer(letter)}
                className={`block w-full text-left p-3 border rounded ${
                  answers[q.id] === letter
                    ? 'bg-blue-600 text-white'
                    : 'bg-white'
                }`}
              >
                {letter}. {choice}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={back}
          disabled={currentIndex === 0}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Back
        </button>

        <button
          onClick={next}
          disabled={currentIndex === questions.length - 1}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
