// app/admin/applicants/page.tsx
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default async function ApplicantsPage() {
  const { data: applicants, error } = await supabase
    .from('applicants')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return <p>Error loading applicants: {error.message}</p>

  return (
    <div>
      <h1>Applicants</h1>
      <Link href="/admin/applicants/new" style={{ color: '#FE5000', fontWeight: 'bold' }}>
        + New Applicant
      </Link>

      <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applicants && applicants.length > 0 ? (
            applicants.map((a) => (
              <tr key={a.id} style={{ borderBottom: '1px solid #ccc' }}>
                <td>{a.first_name}</td>
                <td>{a.last_name}</td>
                <td>{a.email}</td>
                <td>{a.role}</td>
                <td>{a.status}</td>
                <td>
                  <Link href={`/admin/applicants/${a.id}`} style={{ marginRight: '1rem' }}>
                    Edit
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>No applicants found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}