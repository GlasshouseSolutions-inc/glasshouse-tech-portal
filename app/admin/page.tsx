import { supabase } from '@/utils/supabaseServer'

export default async function AdminDashboard() {
  // 1. Load all users (server-side only)
  const { data: users } = await supabase.auth.admin.listUsers()

  // 2. Load test results
  const { data: results } = await supabase
    .from('test_results')
    .select('*')

  // 3. Merge user + result data
  const rows = users.users.map((u) => {
    const result = results?.find((r) => r.applicant_id === u.id)

    return {
      id: u.id,
      email: u.email,
      status: result ? 'Completed' : 'In Progress',
      score: result?.score ?? null,
      total: result?.total_questions ?? null,
      completed_at: result?.completed_at ?? null,
    }
  })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Score</th>
            <th className="p-2 border">Completed</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="p-2 border">{r.email}</td>
              <td className="p-2 border">{r.status}</td>
              <td className="p-2 border">
                {r.score !== null ? `${r.score}/${r.total}` : '-'}
              </td>
              <td className="p-2 border">
                {r.completed_at ? new Date(r.completed_at).toLocaleString() : '-'}
              </td>
              <td className="p-2 border">
                <a
                  href={`/admin/applicant/${r.id}`}
                  className="text-blue-600 underline"
                >
                  View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
