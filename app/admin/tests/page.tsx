// app/admin/tests/page.tsx
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default async function TestsPage() {
  const { data: tests, error } = await supabase
    .from('tests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return <p>Error loading tests: {error.message}</p>

  return (
    <div>
      <h1>Tests</h1>
      <Link href="/admin/tests/new" style={{ color: '#FE5000', fontWeight: 'bold' }}>
        + New Test
      </Link>

      <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tests && tests.length > 0 ? (
            tests.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid #ccc' }}>
                <td>{t.name}</td>
                <td>{t.category}</td>
                <td>{t.description}</td>
                <td>
                  <Link href={`/admin/tests/${t.id}`} style={{ marginRight: '1rem' }}>Edit</Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>No tests found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}