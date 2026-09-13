'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

type Employee = {
  id: string
  first_name: string
  last_name: string
  email: string
  department: string | null
  job_title: string | null
  employment_status: string | null
  source_applicant_id: string | null
  created_at: string | null
}

type SortKey =
  | 'first_name'
  | 'last_name'
  | 'job_title'
  | 'department'
  | 'employment_status'
  | 'email'
  | 'created_at'
  | 'source'

type SortDirection = 'asc' | 'desc'

export default function EmployeesPage() {
  const router = useRouter()

  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  const [sortKey, setSortKey] =
    useState<SortKey>('last_name')

  const [sortDirection, setSortDirection] =
    useState<SortDirection>('asc')

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          id,
          first_name,
          last_name,
          email,
          department,
          job_title,
          employment_status,
          source_applicant_id,
          created_at
        `)

      if (error) {
        alert(error.message)
        setLoading(false)
        return
      }

      setEmployees(data || [])
      setLoading(false)
    }

    fetchEmployees()
  }, [])

  const formatDate = (
    value: string | null
  ) => {
    if (!value) return '—'

    return new Intl.DateTimeFormat(
      'en-US',
      {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }
    ).format(new Date(value))
  }

  const getSortValue = (
    employee: Employee,
    key: SortKey
  ) => {
    switch (key) {
      case 'first_name':
        return employee.first_name || ''

      case 'last_name':
        return employee.last_name || ''

      case 'job_title':
        return employee.job_title || ''

      case 'department':
        return employee.department || ''

      case 'employment_status':
        return employee.employment_status || ''

      case 'email':
        return employee.email || ''

      case 'created_at':
        return employee.created_at
          ? new Date(employee.created_at).getTime()
          : 0

      case 'source':
        return employee.source_applicant_id
          ? 'Applicant'
          : 'Direct'
    }
  }

  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => {
      const aValue = getSortValue(a, sortKey)
      const bValue = getSortValue(b, sortKey)

      if (
        typeof aValue === 'number' &&
        typeof bValue === 'number'
      ) {
        return sortDirection === 'asc'
          ? aValue - bValue
          : bValue - aValue
      }

      const result = String(aValue).localeCompare(
        String(bValue),
        undefined,
        {
          sensitivity: 'base'
        }
      )

      if (result !== 0) {
        return sortDirection === 'asc'
          ? result
          : -result
      }

      if (sortKey === 'last_name') {
        return a.first_name.localeCompare(
          b.first_name,
          undefined,
          {
            sensitivity: 'base'
          }
        )
      }

      if (sortKey === 'first_name') {
        return a.last_name.localeCompare(
          b.last_name,
          undefined,
          {
            sensitivity: 'base'
          }
        )
      }

      return 0
    })
  }, [employees, sortKey, sortDirection])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(current =>
        current === 'asc' ? 'desc' : 'asc'
      )
      return
    }

    setSortKey(key)
    setSortDirection('asc')
  }

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) {
      return ' ↕'
    }

    return sortDirection === 'asc'
      ? ' ▲'
      : ' ▼'
  }

  const sortableHeaderStyle = {
    textAlign: 'left' as const,
    borderBottom: '1px solid #ccc',
    padding: '0.5rem',
    cursor: 'pointer',
    userSelect: 'none' as const
  }

  const normalHeaderStyle = {
    textAlign: 'left' as const,
    borderBottom: '1px solid #ccc',
    padding: '0.5rem'
  }

  const cellStyle = {
    padding: '0.5rem',
    borderBottom: '1px solid #eee'
  }

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}
      >
        <h1>Employees</h1>

        <button
          type="button"
          onClick={() =>
            router.push('/admin/employees/new')
          }
        >
          New Employee
        </button>
      </div>

      {employees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}
        >
          <thead>
            <tr>
              <th
                style={sortableHeaderStyle}
                onClick={() =>
                  handleSort('first_name')
                }
                title="Sort by first name"
              >
                First Name
                {sortIndicator('first_name')}
              </th>

              <th
                style={sortableHeaderStyle}
                onClick={() =>
                  handleSort('last_name')
                }
                title="Sort by last name"
              >
                Last Name
                {sortIndicator('last_name')}
              </th>

              <th
                style={sortableHeaderStyle}
                onClick={() =>
                  handleSort('job_title')
                }
                title="Sort by job title"
              >
                Job Title
                {sortIndicator('job_title')}
              </th>

              <th
                style={sortableHeaderStyle}
                onClick={() =>
                  handleSort('department')
                }
                title="Sort by department"
              >
                Department
                {sortIndicator('department')}
              </th>

              <th
                style={sortableHeaderStyle}
                onClick={() =>
                  handleSort(
                    'employment_status'
                  )
                }
                title="Sort by status"
              >
                Status
                {sortIndicator(
                  'employment_status'
                )}
              </th>

              <th
                style={sortableHeaderStyle}
                onClick={() =>
                  handleSort('email')
                }
                title="Sort by email"
              >
                Email
                {sortIndicator('email')}
              </th>

              <th
                style={sortableHeaderStyle}
                onClick={() =>
                  handleSort('created_at')
                }
                title="Sort by date added"
              >
                Added
                {sortIndicator('created_at')}
              </th>

              <th
                style={sortableHeaderStyle}
                onClick={() =>
                  handleSort('source')
                }
                title="Sort by source"
              >
                Source
                {sortIndicator('source')}
              </th>

              <th style={normalHeaderStyle}>
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedEmployees.map(employee => (
              <tr key={employee.id}>
                <td style={cellStyle}>
                  {employee.first_name}
                </td>

                <td style={cellStyle}>
                  {employee.last_name}
                </td>

                <td style={cellStyle}>
                  {employee.job_title || '—'}
                </td>

                <td style={cellStyle}>
                  {employee.department || '—'}
                </td>

                <td style={cellStyle}>
                  {employee.employment_status || '—'}
                </td>

                <td style={cellStyle}>
                  {employee.email}
                </td>

                <td style={cellStyle}>
                  {formatDate(employee.created_at)}
                </td>

                <td style={cellStyle}>
                  {employee.source_applicant_id
                    ? 'Applicant'
                    : 'Direct'}
                </td>

                <td style={cellStyle}>
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/admin/employees/${employee.id}`
                      )
                    }
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}