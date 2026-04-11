'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'

export default function EditQuestionForm({ question }) {
  const router = useRouter()

  const [questionText, setQuestionText] = useState(question?.question_text ?? "")
  const [choiceA, setChoiceA] = useState(question?.choice_a ?? "")
  const [choiceB, setChoiceB] = useState(question?.choice_b ?? "")
  const [choiceC, setChoiceC] = useState(question?.choice_c ?? "")
  const [choiceD, setChoiceD] = useState(question?.choice_d ?? "")
  const [correct, setCorrect] = useState(question?.correct_answer ?? "A")
  const [saving, setSaving] = useState(false)

  const saveQuestion = async () => {
    setSaving(true)

    await supabase
      .from('questions')
      .update({
        question_text: questionText,
        choice_a: choiceA,
        choice_b: choiceB,
        choice_c: choiceC,
        choice_d: choiceD,
        correct_answer: correct
      })
      .eq('id', question.id)

    router.push('/admin/questions')
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Question</h1>

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
