// app/admin/assignments/page.tsx

import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default async function AssignmentsPage() {
  const { data, error } = await supabase
    .from('assignments')
    .select(`
      *,
      applicants(first_name,last_name),
      tests(name)
    `)
    .order('assigned_at', { ascending: false })

  if (error) {
    return <p>{error.message}</p>
  }

  return (
    <div>
      <h1>Assignments</h1>

      <Link href="/admin/assignments/new">
        + New Assignment
      </Link>

      <table>
        <thead>
          <tr>
            <th>Applicant</th>
            <th>Test</th>
            <th>Difficulty</th>
            <th>Questions</th>
            <th>Purpose</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {data?.map((assignment) => (
            <tr key={assignment.id}>
              <td>
                {assignment.applicants?.first_name}{' '}
                {assignment.applicants?.last_name}
              </td>

              <td>
                {assignment.tests?.name}
              </td>

              <td>
                {assignment.difficulty || '-'}
              </td>

              <td>
                {assignment.question_count ?? '-'}
              </td>

              <td>
                {assignment.purpose || '-'}
              </td>

              <td>
                {assignment.status}
              </td>

              <td>
                <Link href={`/admin/assignments/${assignment.id}`}>
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}