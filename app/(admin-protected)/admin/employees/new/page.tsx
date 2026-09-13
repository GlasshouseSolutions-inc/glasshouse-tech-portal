'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function NewEmployeePage() {
  const router = useRouter()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !jobTitle.trim()
    ) {
      alert(
        'First name, last name, email, and job title are required.'
      )
      return
    }

    setSaving(true)

    const { data, error } = await supabase.rpc(
      'create_employee',
      {
        p_first_name: firstName.trim(),
        p_last_name: lastName.trim(),
        p_email: email.trim(),
        p_job_title: jobTitle.trim(),
        p_department:
          department.trim() || null
      }
    )

    setSaving(false)

    if (error) {
      alert(error.message)
      return
    }

    alert(
      `${firstName.trim()} ${lastName.trim()} was successfully created as an employee.`
    )

    router.push(`/admin/employees/${data}`)
  }

  return (
    <div
      style={{
        maxWidth: '700px'
      }}
    >
      <h1>New Employee</h1>

      <p
        style={{
          marginBottom: '1.5rem'
        }}
      >
        Create an employee who did not enter the
        system through the applicant workflow.
      </p>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            marginBottom: '1rem'
          }}
        >
          <label
            htmlFor="firstName"
            style={{
              display: 'block',
              marginBottom: '0.25rem'
            }}
          >
            First Name
          </label>

          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={event =>
              setFirstName(event.target.value)
            }
            disabled={saving}
            style={{
              width: '100%',
              padding: '0.5rem'
            }}
          />
        </div>

        <div
          style={{
            marginBottom: '1rem'
          }}
        >
          <label
            htmlFor="lastName"
            style={{
              display: 'block',
              marginBottom: '0.25rem'
            }}
          >
            Last Name
          </label>

          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={event =>
              setLastName(event.target.value)
            }
            disabled={saving}
            style={{
              width: '100%',
              padding: '0.5rem'
            }}
          />
        </div>

        <div
          style={{
            marginBottom: '1rem'
          }}
        >
          <label
            htmlFor="email"
            style={{
              display: 'block',
              marginBottom: '0.25rem'
            }}
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={event =>
              setEmail(event.target.value)
            }
            disabled={saving}
            style={{
              width: '100%',
              padding: '0.5rem'
            }}
          />
        </div>

        <div
          style={{
            marginBottom: '1rem'
          }}
        >
          <label
            htmlFor="jobTitle"
            style={{
              display: 'block',
              marginBottom: '0.25rem'
            }}
          >
            Job Title
          </label>

          <input
            id="jobTitle"
            type="text"
            value={jobTitle}
            onChange={event =>
              setJobTitle(event.target.value)
            }
            disabled={saving}
            style={{
              width: '100%',
              padding: '0.5rem'
            }}
          />
        </div>

        <div
          style={{
            marginBottom: '1.5rem'
          }}
        >
          <label
            htmlFor="department"
            style={{
              display: 'block',
              marginBottom: '0.25rem'
            }}
          >
            Department
          </label>

          <input
            id="department"
            type="text"
            value={department}
            onChange={event =>
              setDepartment(event.target.value)
            }
            disabled={saving}
            style={{
              width: '100%',
              padding: '0.5rem'
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.75rem'
          }}
        >
          <button
            type="submit"
            disabled={saving}
          >
            {saving
              ? 'Creating...'
              : 'Create Employee'}
          </button>

          <button
            type="button"
            onClick={() =>
              router.push('/admin/employees')
            }
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}