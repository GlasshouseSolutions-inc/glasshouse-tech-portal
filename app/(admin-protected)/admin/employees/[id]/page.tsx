//admin/employees/[id]/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function EmployeePage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const [employee, setEmployee] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const employmentStatuses = [
    'Active',
    'Inactive'
  ]

  useEffect(() => {
    const fetchEmployee = async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        alert(error.message)
        router.push('/admin/employees')
        return
      }

      setEmployee(data)
      setLoading(false)
    }

    fetchEmployee()
  }, [id, router])

  const handleSave = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    setSaving(true)

    const { error } = await supabase
      .from('employees')
      .update({
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        department:
          employee.department?.trim() || null,
        job_title:
          employee.job_title?.trim() || null,
        employment_status:
          employee.employment_status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    setSaving(false)

    if (error) {
      alert(error.message)
      return
    }

    alert('Employee record updated successfully.')
  }

  const formatDateTime = (
    value: string | null
  ) => {
    if (!value) return '—'

    return new Intl.DateTimeFormat(
      'en-US',
      {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }
    ).format(new Date(value))
  }

  if (loading) {
    return <p>Loading...</p>
  }

  if (!employee) {
    return <p>Employee not found.</p>
  }

  return (
    <div>
      <h1>Employee</h1>

      <form onSubmit={handleSave}>
        <div>
          <label>First Name</label>
          <input
            value={employee.first_name}
            onChange={e =>
              setEmployee({
                ...employee,
                first_name: e.target.value
              })
            }
            required
          />
        </div>

        <div>
          <label>Last Name</label>
          <input
            value={employee.last_name}
            onChange={e =>
              setEmployee({
                ...employee,
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
            value={employee.email}
            onChange={e =>
              setEmployee({
                ...employee,
                email: e.target.value
              })
            }
            required
          />
        </div>

        <div>
          <label>Department</label>
          <input
            value={employee.department || ''}
            onChange={e =>
              setEmployee({
                ...employee,
                department: e.target.value
              })
            }
          />
        </div>

        <div>
          <label>Job Title</label>
          <input
            value={employee.job_title || ''}
            onChange={e =>
              setEmployee({
                ...employee,
                job_title: e.target.value
              })
            }
          />
        </div>

        <div>
          <label>Employment Status</label>
          <select
            value={
              employee.employment_status ||
              'Active'
            }
            onChange={e =>
              setEmployee({
                ...employee,
                employment_status:
                  e.target.value
              })
            }
          >
            {employmentStatuses.map(status => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
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
            onClick={() =>
              router.push('/admin/employees')
            }
            style={{ marginLeft: '1rem' }}
          >
            Back to Employees
          </button>
        </div>
      </form>

      <div
        style={{
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid #ccc'
        }}
      >
        <h2>Employee Information</h2>

        <p>
          <strong>Created:</strong>{' '}
          {formatDateTime(employee.created_at)}
        </p>

        <p>
          <strong>Last Updated:</strong>{' '}
          {formatDateTime(employee.updated_at)}
        </p>

        {employee.source_applicant_id && (
          <div>
            <p>
              This employee was converted from
              an applicant record.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/admin/applicants/${employee.source_applicant_id}`
                )
              }
            >
              View Source Applicant
            </button>
          </div>
        )}
      </div>
    </div>
  )
}