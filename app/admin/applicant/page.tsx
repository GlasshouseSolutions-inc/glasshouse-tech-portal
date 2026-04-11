import { supabase } from '@/utils/supabaseServer'
import Link from 'next/link'

export default async function ApplicantListPage() {
  const { data: applicants } = await supabase
    .from('test_results')
    .select('applicant_id, score, completed_at')

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Applicants</h1>

      <div className="space-y-4">
        {applicants?.map((a) => (
          <div key={a.applicant_id} className="border p-4 rounded">
            <p><strong>ID:</strong> {a.applicant_id}</p>
            <p><strong>Score:</strong> {a.score}</p>
            <p><strong>Completed:</strong> {new Date(a.completed_at).toLocaleString()}</p>

            <Link
              href={`/admin/applicant/${a.applicant_id}`}
              className="text-blue-600 underline"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
