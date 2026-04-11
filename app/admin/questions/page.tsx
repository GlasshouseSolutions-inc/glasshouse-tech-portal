import { supabase } from '@/utils/supabaseServer'
import { requireAdmin } from '@/utils/checkAdmin'
import Link from 'next/link'

export default async function QuestionsPage() {
  await requireAdmin()

  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .order('id', { ascending: true })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Questions</h1>

        <Link
          href="/admin/questions/new"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Add Question
        </Link>
      </div>

      {!questions?.length && (
        <p className="text-gray-600">No questions found.</p>
      )}

      {questions?.length ? (
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Question</th>
              <th className="p-2 border">Active</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {questions.map((q) => (
              <tr key={q.id}>
                <td className="p-2 border">{q.id}</td>
                <td className="p-2 border">{q.question_text}</td>
                <td className="p-2 border">{q.is_active ? 'Yes' : 'No'}</td>
                <td className="p-2 border">
                  <Link
                    href={`/admin/questions/${q.id}`}
                    className="text-blue-600 underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  )
}
