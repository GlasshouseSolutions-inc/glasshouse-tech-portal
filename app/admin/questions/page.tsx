// app/admin/questions/page.tsx
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default async function QuestionsPage() {
  const { data: questions, error } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <p>Error loading questions: {error.message}</p>
  }

  return (
    <div>
      <h1>Questions</h1>
      <Link href="/admin/questions/new" style={{ color: '#FE5000', fontWeight: 'bold' }}>
        + New Question
      </Link>

      <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Category</th>
            <th>Type</th>
            <th>Question</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions && questions.length > 0 ? (
            questions.map((q) => (
              <tr key={q.id} style={{ borderBottom: '1px solid #ccc' }}>
                <td>{q.category}</td>
                <td>{q.question_type}</td>
                <td>{q.question_text}</td>
                <td>
                  <Link href={`/admin/questions/${q.id}`} style={{ marginRight: '1rem' }}>
                    Edit
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>No questions found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}