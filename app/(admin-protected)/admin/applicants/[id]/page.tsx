// admin/applicants/[id]/page.tsx
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

  const [showConvertForm, setShowConvertForm] = useState(false)
  const [jobTitle, setJobTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [converting, setConverting] = useState(false)

  const roles = [
    'Technician',
    'Sales',
    'Marketer',
    'Marketing',
    'Operations',
    'Leadership'
  ]

  const statuses = [
    'Candidate',
    'Active',
    'Inactive',
    'Rejected',
    'Withdrawn'
  ]

  useEffect(() => {
    const fetchApplicant = async () => {
      const { data, error } = await supabase
        .from('applicants')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        alert(error.message)
        router.push('/admin/applicants')
      } else {
        setApplicant(data)
      }

      setLoading(false)
    }

    fetchApplicant()
  }, [id, router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    setSaving(true)

    const { error } = await supabase
      .from('applicants')
      .update({
        first_name: applicant.first_name,
        last_name: applicant.last_name,
        email: applicant.email,
        role: applicant.role,
        status: applicant.status
      })
      .eq('id', id)

    setSaving(false)

    if (error) {
      alert(error.message)
    } else {
      router.push('/admin/applicants')
    }
  }

  const handleConvertToEmployee = async () => {
    if (!jobTitle.trim()) {
      alert('Job Title is required.')
      return
    }

    if (
      applicant.status !== 'Candidate' &&
      applicant.status !== 'Active'
    ) {
      alert(
        'Only applicants with Candidate or Active status can be converted to employees.'
      )
      return
    }

    const confirmed = confirm(
      `Convert ${applicant.first_name} ${applicant.last_name} to an employee?`
    )

    if (!confirmed) return

    setConverting(true)

    const { data, error } = await supabase.rpc(
      'convert_applicant_to_employee',
      {
        p_applicant_id: id,
        p_job_title: jobTitle.trim(),
        p_department: department.trim() || null
      }
    )

    setConverting(false)

    if (error) {
      alert(error.message)
      return
    }

    alert(
      `${applicant.first_name} ${applicant.last_name} was successfully converted to an employee.`
    )

    router.push(`/admin/employees/${data}`)
  }

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this applicant?'
      )
    ) {
      return
    }

    const { error } = await supabase
      .from('applicants')
      .delete()
      .eq('id', id)

    if (!error) {
      router.push('/admin/applicants')
    } else {
      alert(error.message)
    }
  }

  const canConvert =
    applicant?.status === 'Candidate' ||
    applicant?.status === 'Active'

  if (loading) return <p>Loading...</p>
  if (!applicant) return <p>Applicant not found.</p>

  return (
    <div>
      <h1>Edit Applicant</h1>

      <form onSubmit={handleSave}>
        <div>
          <label>First Name</label>
          <input
            value={applicant.first_name}
            onChange={e =>
              setApplicant({
                ...applicant,
                first_name: e.target.value
              })
            }
            required
          />
        </div>

        <div>
          <label>Last Name</label>
          <input
            value={applicant.last_name}
            onChange={e =>
              setApplicant({
                ...applicant,
                last_name: e.target.value
              })
            }
            required
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            value={applicant.email}
            onChange={e =>
              setApplicant({
                ...applicant,
                email: e.target.value
              })
            }
            required
          />
        </div>

        <div>
          <label>Role</label>
          <select
            value={applicant.role}
            onChange={e =>
              setApplicant({
                ...applicant,
                role: e.target.value
              })
            }
          >
            {roles.map(r => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Status</label>
          <select
            value={applicant.status}
            onChange={e =>
              setApplicant({
                ...applicant,
                status: e.target.value
              })
            }
          >
            {statuses.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}

            {applicant.status === 'Hired' && (
              <option value="Hired">
                Hired
              </option>
            )}
          </select>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <button
            type="submit"
            disabled={saving}
          >
            {saving
              ? 'Saving...'
              : 'Save Changes'}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            style={{
              marginLeft: '1rem',
              color: 'red'
            }}
          >
            Delete Applicant
          </button>
        </div>
      </form>

      {canConvert && (
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid #ccc'
          }}
        >
          <h2>Convert to Employee</h2>

          {!showConvertForm ? (
            <button
              type="button"
              onClick={() =>
                setShowConvertForm(true)
              }
            >
              Convert to Employee
            </button>
          ) : (
            <div>
              <div>
                <label>Job Title</label>
                <input
                  value={jobTitle}
                  onChange={e =>
                    setJobTitle(e.target.value)
                  }
                  placeholder="Field Service Technician I"
                />
              </div>

              <div>
                <label>Department</label>
                <input
                  value={department}
                  onChange={e =>
                    setDepartment(e.target.value)
                  }
                  placeholder="Technical Services"
                />
              </div>

              <div
                style={{ marginTop: '1rem' }}
              >
                <button
                  type="button"
                  onClick={
                    handleConvertToEmployee
                  }
                  disabled={converting}
                >
                  {converting
                    ? 'Converting...'
                    : 'Create Employee'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowConvertForm(false)
                    setJobTitle('')
                    setDepartment('')
                  }}
                  disabled={converting}
                  style={{
                    marginLeft: '1rem'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}