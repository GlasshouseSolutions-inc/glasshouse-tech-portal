//app/admin/applicants/new/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function NewApplicantPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Technician')
  const [status, setStatus] = useState('Candidate')
  const [loading, setLoading] = useState(false)

  const roles = ['Technician', 'Sales', 'Marketer', 'Marketing', 'Operations', 'Leadership']
  const statuses = ['Candidate', 'Active', 'Inactive']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('applicants').insert([
      { first_name: firstName, last_name: lastName, email, role, status }
    ])

    setLoading(false)
    if (error) alert(error.message)
    else router.push('/admin/applicants')
  }

  return (
    <div>
      <h1>New Applicant</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>First Name</label>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </div>

        <div>
          <label>Last Name</label>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>

        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div>
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {roles.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {statuses.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Applicant'}</button>
      </form>
    </div>
  )
}