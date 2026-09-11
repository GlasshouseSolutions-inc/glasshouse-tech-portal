//app/admin/results/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

type Result = {
  id: string
  applicant_id: string
  test_id: string
  score: number
  recommendation: string
  completed_at: string
  applicant_name?: string
  test_name?: string
}

export default function ResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)

  async function loadResults() {
    setLoading(true)
    const { data, error } = await supabase
      .from('test_results')
      .select(`
        id,
        score,
        recommendation,
        completed_at,
        applicant:applicant_id (
          id,
          first_name,
          last_name
        ),
        test:test_id (
          id,
          name
        )
      `)

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    const formatted: Result[] =
      (data || []).map((r: any) => ({
        ...r,
        applicant_name: r.applicant
          ? `${r.applicant.first_name} ${r.applicant.last_name}`
          : 'Unknown',
        test_name: r.test ? r.test.name : 'Unknown'
      }))

    setResults(formatted)
    setLoading(false)
  }

  useEffect(() => {
    loadResults()
  }, [])

  if (loading) return <p>Loading results...</p>

  return (
    <div className="page-container">
      <h1>Test Results</h1>
      {results.length === 0 ? (
        <p>No results recorded yet.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Test</th>
                <th>Score</th>
                <th>Recommendation</th>
                <th>Completed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id}>
                  <td>{r.applicant_name}</td>
                  <td>{r.test_name}</td>
                  <td>{r.score}</td>
                  <td>{r.recommendation}</td>
                  <td>{r.completed_at?.slice(0, 10) || '-'}</td>
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() =>
                        router.push(`/admin/results/${r.id}`)
                      }
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}