// app/admin/page.tsx
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default async function AdminDashboard() {
  // Fetch counts from Supabase
  const counts = await Promise.all([
    supabase.from('applicants').select('*', { count: 'exact' }),
    supabase.from('questions').select('*', { count: 'exact' }),
    supabase.from('tests').select('*', { count: 'exact' }),
    supabase.from('assignments').select('*', { count: 'exact' }),
    supabase.from('test_results').select('*', { count: 'exact' }),
  ])

  const [applicantsCount, questionsCount, testsCount, assignmentsCount, resultsCount] = counts.map(c => c.count ?? 0)

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    flex: 1,
    margin: '0.5rem',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    textAlign: 'center',
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'inherit',
  }

  const cards = [
    { name: 'Applicants', count: applicantsCount, href: '/admin/applicants' },
    { name: 'Questions', count: questionsCount, href: '/admin/questions' },
    { name: 'Tests', count: testsCount, href: '/admin/tests' },
    { name: 'Assignments', count: assignmentsCount, href: '/admin/assignments' },
    { name: 'Results', count: resultsCount, href: '/admin/results' },
  ]

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Dashboard</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {cards.map(card => (
          <Link key={card.name} href={card.href} style={cardStyle}>
            <h2>{card.name}</h2>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{card.count}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}