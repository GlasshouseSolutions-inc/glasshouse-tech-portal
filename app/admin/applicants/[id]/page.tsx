//admin/applicants/[id]/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function EditApplicantPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const [applicant, setApplicant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const roles = ['Technician', 'Sales', 'Marketer', 'Marketing', 'Operations', 'Leadership']
  const statuses = ['Candidate', 'Active', 'Inactive']

  useEffect(() => {
    const fetchApplicant = async () => {
      const { data, error } = await supabase.from('applicants').select('*').eq('id', id).single()
      if (error) {
        alert(error.message)
        router.push('/admin/applicants')
      } else setApplicant(data)
      setLoading(false)
    }
    fetchApplicant()
  }, [id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('applicants').update({
      first_name: applicant.first_name,
      last_name: applicant.last_name,
      email: applicant.email,
      role: applicant.role,
      status: applicant.status
    }).eq('id', id)
    setSaving(false)
    if (error) alert(error.message)
    else router.push('/admin/applicants')
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this applicant?')) return
    const { error } = await supabase.from('applicants').delete().eq('id', id)
    if (!error) router.push('/admin/applicants')
    else alert(error.message)
  }

  if (loading) return <p>Loading...</p>
  if (!applicant) return <p>Applicant not found.</p>

  return (
    <div>
      <h1>Edit Applicant</h1>
      <form onSubmit={handleSave}>
        <div>
          <label>First Name</label>
          <input value={applicant.first_name} onChange={e => setApplicant({ ...applicant, first_name: e.target.value })} required />
        </div>

        <div>
          <label>Last Name</label>
          <input value={applicant.last_name} onChange={e => setApplicant({ ...applicant, last_name: e.target.value })} required />
        </div>

        <div>
          <label>Email</label>
          <input type="email" value={applicant.email} onChange={e => setApplicant({ ...applicant, email: e.target.value })} required />
        </div>

        <div>
          <label>Role</label>
          <select value={applicant.role} onChange={e => setApplicant({ ...applicant, role: e.target.value })}>
            {roles.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label>Status</label>
          <select value={applicant.status} onChange={e => setApplicant({ ...applicant, status: e.target.value })}>
            {statuses.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        <button type="button" onClick={handleDelete} style={{ marginLeft: '1rem', color: 'red' }}>Delete Applicant</button>
      </form>
    </div>
  )
}