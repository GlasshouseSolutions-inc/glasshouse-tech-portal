'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'

export default function NewQuestionForm() {
  const router = useRouter()

  const [questionText, setQuestionText] = useState('')
  const [choiceA, setChoiceA] = useState('')
  const [choiceB, setChoiceB] = useState('')
  const [choiceC, setChoiceC] = useState('')
  const [choiceD, setChoiceD] = useState('')
  const [correct, setCorrect] = useState('A')
  const [saving, setSaving] = useState(false)

  const saveQuestion = async () => {
    setSaving(true)

    await supabase.from('questions').insert({
      question_text: questionText,
      choice_a: choiceA,
      choice_b: choiceB,
      choice_c: choiceC,
      choice_d: choiceD,
      correct_answer: correct,
      is_active: true,
    })

    router.push('/admin/questions')
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add New Question</h1>

      <div className="space-y-4">
        <input
          className="w-full border p-2 rounded"
          placeholder="Question text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Choice A"
          value={choiceA}
          onChange={(e) => setChoiceA(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Choice B"
          value={choiceB}
          onChange={(e) => setChoiceB(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Choice C"
          value={choiceC}
          onChange={(e) => setChoiceC(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Choice D"
          value={choiceD}
          onChange={(e) => setChoiceD(e.target.value)}
        />

        <select
          className="w-full border p-2 rounded"
          value={correct}
          onChange={(e) => setCorrect(e.target.value)}
        >
          <option value="A">Correct Answer: A</option>
          <option value="B">Correct Answer: B</option>
          <option value="C">Correct Answer: C</option>
          <option value="D">Correct Answer: D</option>
        </select>

        <button
          onClick={saveQuestion}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {saving ? 'Saving…' : 'Save Question'}
        </button>
      </div>
    </div>
  )
}
