import { requireAdmin } from '@/utils/checkAdmin'

export default async function AdminDashboard() {
  await requireAdmin()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/admin/questions/new"
          className="p-6 bg-white border rounded-lg shadow-sm hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold mb-2">Add Question</h2>
          <p className="text-gray-600">Create a new test question.</p>
        </a>

        <a
          href="/admin/questions"
          className="p-6 bg-white border rounded-lg shadow-sm hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold mb-2">Manage Questions</h2>
          <p className="text-gray-600">Edit or delete existing questions.</p>
        </a>

        <a
          href="/admin"
          className="p-6 bg-white border rounded-lg shadow-sm hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold mb-2">View Results</h2>
          <p className="text-gray-600">See applicant test scores.</p>
        </a>
      </div>
    </div>
  )
}
