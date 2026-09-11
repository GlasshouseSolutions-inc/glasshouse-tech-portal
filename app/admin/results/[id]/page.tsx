// app/admin/results/[id]/page.tsx

import { supabase } from '@/lib/supabase/client'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

interface TestResult {
  id: string
  applicant_id: string
  test_id: string
  score: number | null
  created_at: string | null
}

export default async function ResultDetailsPage({
  params,
}: PageProps) {
  const { id } = await params

  const { data, error } = await supabase
    .from('test_results')
    .select('*')
    .eq('applicant_id', id)

  if (error) {
    console.error(error)

    return (
      <div>
        <h1>Results</h1>
        <p>Error loading results.</p>
      </div>
    )
  }

  const results = (data ?? []) as TestResult[]

  return (
    <div>
      <h1>Applicant Results</h1>

      {results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        results.map((result) => (
          <div
            key={result.id}
            style={{
              border: '1px solid #ddd',
              padding: '1rem',
              marginBottom: '1rem',
            }}
          >
            <p>
              <strong>Result ID:</strong>{' '}
              {result.id}
            </p>

            <p>
              <strong>Applicant ID:</strong>{' '}
              {result.applicant_id}
            </p>

            <p>
              <strong>Test ID:</strong>{' '}
              {result.test_id}
            </p>

            <p>
              <strong>Score:</strong>{' '}
              {result.score ?? 'Not scored'}
            </p>

            <p>
              <strong>Created:</strong>{' '}
              {result.created_at ?? 'Unknown'}
            </p>
          </div>
        ))
      )}
    </div>
  )
}