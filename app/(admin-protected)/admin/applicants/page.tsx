'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

type Applicant = {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  status: string
  created_at: string | null
  employee_id: string | null
}

type SortKey =
  | 'first_name'
  | 'last_name'
  | 'email'
  | 'role'
  | 'status'
  | 'employee'

type SortDirection = 'asc' | 'desc'

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showBulkConvert, setShowBulkConvert] = useState(false)

  const [jobTitle, setJobTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [converting, setConverting] = useState(false)

  const [sortKey, setSortKey] =
    useState<SortKey>('last_name')

  const [sortDirection, setSortDirection] =
    useState<SortDirection>('asc')

  const fetchApplicants = useCallback(async () => {
    setLoading(true)

    const { data: applicantData, error: applicantError } =
      await supabase
        .from('applicants')
        .select(`
          id,
          first_name,
          last_name,
          email,
          role,
          status,
          created_at
        `)

    if (applicantError) {
      alert(
        `Error loading applicants: ${applicantError.message}`
      )
      setLoading(false)
      return
    }

    const { data: employeeData, error: employeeError } =
      await supabase
        .from('employees')
        .select(`
          id,
          source_applicant_id
        `)

    if (employeeError) {
      alert(
        `Error loading employee links: ${employeeError.message}`
      )
      setLoading(false)
      return
    }

    const employeeMap = new Map<string, string>()

    for (const employee of employeeData || []) {
      if (employee.source_applicant_id) {
        employeeMap.set(
          employee.source_applicant_id,
          employee.id
        )
      }
    }

    const combinedApplicants: Applicant[] =
      (applicantData || []).map(applicant => ({
        ...applicant,
        employee_id:
          employeeMap.get(applicant.id) || null
      }))

    setApplicants(combinedApplicants)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchApplicants()
  }, [fetchApplicants])

  const isEligible = (applicant: Applicant) => {
    return (
      (
        applicant.status === 'Candidate' ||
        applicant.status === 'Active'
      ) &&
      !applicant.employee_id
    )
  }

  const eligibleApplicants =
    applicants.filter(isEligible)

  const selectedApplicants =
    applicants.filter(applicant =>
      selectedIds.includes(applicant.id)
    )

  const allEligibleSelected =
    eligibleApplicants.length > 0 &&
    eligibleApplicants.every(applicant =>
      selectedIds.includes(applicant.id)
    )

  const getSortValue = (
    applicant: Applicant,
    key: SortKey
  ) => {
    switch (key) {
      case 'first_name':
        return applicant.first_name || ''

      case 'last_name':
        return applicant.last_name || ''

      case 'email':
        return applicant.email || ''

      case 'role':
        return applicant.role || ''

      case 'status':
        return applicant.status || ''

      case 'employee':
        return applicant.employee_id
          ? 'Yes'
          : 'No'
    }
  }

  const sortedApplicants = useMemo(() => {
    return [...applicants].sort((a, b) => {
      const aValue = getSortValue(a, sortKey)
      const bValue = getSortValue(b, sortKey)

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
  }, [
    applicants,
    sortKey,
    sortDirection
  ])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(current =>
        current === 'asc'
          ? 'desc'
          : 'asc'
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
    padding: '0.5rem',
    borderBottom: '1px solid #ccc',
    cursor: 'pointer',
    userSelect: 'none' as const
  }

  const normalHeaderStyle = {
    textAlign: 'left' as const,
    padding: '0.5rem',
    borderBottom: '1px solid #ccc'
  }

  const cellStyle = {
    padding: '0.5rem',
    borderBottom: '1px solid #ccc'
  }

  const toggleApplicant = (
    applicantId: string
  ) => {
    setSelectedIds(current =>
      current.includes(applicantId)
        ? current.filter(
          id => id !== applicantId
        )
        : [...current, applicantId]
    )
  }

  const toggleSelectAllEligible = () => {
    if (allEligibleSelected) {
      setSelectedIds([])
      setShowBulkConvert(false)
      return
    }

    setSelectedIds(
      eligibleApplicants.map(
        applicant => applicant.id
      )
    )
  }

  const clearSelection = () => {
    setSelectedIds([])
    setShowBulkConvert(false)
    setJobTitle('')
    setDepartment('')
  }

  const handleBulkConvert = async () => {
    if (selectedIds.length === 0) {
      alert(
        'Select at least one eligible applicant.'
      )
      return
    }

    if (!jobTitle.trim()) {
      alert('Job title is required.')
      return
    }

    const currentSelectedApplicants =
      applicants.filter(
        applicant =>
          selectedIds.includes(
            applicant.id
          ) &&
          isEligible(applicant)
      )

    if (
      currentSelectedApplicants.length !==
      selectedIds.length
    ) {
      alert(
        'One or more selected applicants are no longer eligible for conversion. Refresh the page and try again.'
      )
      return
    }

    const names =
      currentSelectedApplicants
        .map(
          applicant =>
            `${applicant.first_name} ${applicant.last_name}`
        )
        .join(', ')

    const confirmed =
      window.confirm(
        `Convert ${currentSelectedApplicants.length} applicant${currentSelectedApplicants.length === 1
          ? ''
          : 's'
        } to employees?\n\n` +
        `Job Title: ${jobTitle.trim()}\n` +
        `Department: ${department.trim() ||
        'Not specified'
        }\n\n` +
        `Applicants: ${names}`
      )

    if (!confirmed) {
      return
    }

    setConverting(true)

    const successes: string[] = []
    const failures: string[] = []

    for (
      const applicant
      of currentSelectedApplicants
    ) {
      const { error } =
        await supabase.rpc(
          'convert_applicant_to_employee',
          {
            p_applicant_id:
              applicant.id,
            p_job_title:
              jobTitle.trim(),
            p_department:
              department.trim() ||
              null
          }
        )

      if (error) {
        failures.push(
          `${applicant.first_name} ${applicant.last_name}: ${error.message}`
        )
      } else {
        successes.push(
          `${applicant.first_name} ${applicant.last_name}`
        )
      }
    }

    setConverting(false)

    if (failures.length > 0) {
      alert(
        `Bulk conversion completed with some errors.\n\n` +
        `Successful: ${successes.length}\n` +
        `Failed: ${failures.length}\n\n` +
        failures.join('\n')
      )
    } else {
      alert(
        `${successes.length} applicant${successes.length === 1
          ? ''
          : 's'
        } successfully converted to employees.`
      )
    }

    clearSelection()
    await fetchApplicants()
  }

  if (loading) {
    return (
      <p>Loading applicants...</p>
    )
  }

  return (
    <div>
      <h1>Applicants</h1>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem'
        }}
      >
        <Link
          href="/admin/applicants/new"
          style={{
            color: '#FE5000',
            fontWeight: 'bold'
          }}
        >
          + New Applicant
        </Link>

        {selectedIds.length > 0 && (
          <>
            <button
              type="button"
              onClick={() =>
                setShowBulkConvert(true)
              }
            >
              Convert Selected to Employees
            </button>

            <button
              type="button"
              onClick={clearSelection}
            >
              Clear Selection
            </button>

            <span>
              {selectedIds.length} selected
            </span>
          </>
        )}
      </div>

      {showBulkConvert &&
        selectedIds.length > 0 && (
          <div
            style={{
              border: '1px solid #ccc',
              padding: '1rem',
              marginBottom: '1rem',
              maxWidth: '600px'
            }}
          >
            <h2>
              Bulk Convert to Employees
            </h2>

            <p>
              The selected applicants will
              all receive the same Job Title
              and Department.
            </p>

            <div
              style={{
                marginBottom: '1rem'
              }}
            >
              <label
                htmlFor="bulkJobTitle"
                style={{
                  display: 'block',
                  marginBottom:
                    '0.25rem'
                }}
              >
                Job Title
              </label>

              <input
                id="bulkJobTitle"
                type="text"
                value={jobTitle}
                onChange={event =>
                  setJobTitle(
                    event.target.value
                  )
                }
                disabled={converting}
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
                htmlFor="bulkDepartment"
                style={{
                  display: 'block',
                  marginBottom:
                    '0.25rem'
                }}
              >
                Department
              </label>

              <input
                id="bulkDepartment"
                type="text"
                value={department}
                onChange={event =>
                  setDepartment(
                    event.target.value
                  )
                }
                disabled={converting}
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
                type="button"
                onClick={
                  handleBulkConvert
                }
                disabled={converting}
              >
                {converting
                  ? 'Converting...'
                  : `Convert ${selectedIds.length} Applicant${selectedIds.length ===
                    1
                    ? ''
                    : 's'
                  }`}
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowBulkConvert(
                    false
                  )
                }
                disabled={converting}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      <table
        style={{
          width: '100%',
          marginTop: '1rem',
          borderCollapse: 'collapse'
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                ...normalHeaderStyle,
                textAlign: 'center'
              }}
            >
              <input
                type="checkbox"
                checked={
                  allEligibleSelected
                }
                onChange={
                  toggleSelectAllEligible
                }
                disabled={
                  eligibleApplicants.length ===
                  0
                }
                title="Select all eligible applicants"
              />
            </th>

            <th
              style={
                sortableHeaderStyle
              }
              onClick={() =>
                handleSort('first_name')
              }
              title="Sort by first name"
            >
              First Name
              {sortIndicator(
                'first_name'
              )}
            </th>

            <th
              style={
                sortableHeaderStyle
              }
              onClick={() =>
                handleSort('last_name')
              }
              title="Sort by last name"
            >
              Last Name
              {sortIndicator(
                'last_name'
              )}
            </th>

            <th
              style={
                sortableHeaderStyle
              }
              onClick={() =>
                handleSort('email')
              }
              title="Sort by email"
            >
              Email
              {sortIndicator('email')}
            </th>

            <th
              style={
                sortableHeaderStyle
              }
              onClick={() =>
                handleSort('role')
              }
              title="Sort by role"
            >
              Role
              {sortIndicator('role')}
            </th>

            <th
              style={
                sortableHeaderStyle
              }
              onClick={() =>
                handleSort('status')
              }
              title="Sort by status"
            >
              Status
              {sortIndicator('status')}
            </th>

            <th
              style={
                sortableHeaderStyle
              }
              onClick={() =>
                handleSort('employee')
              }
              title="Sort by employee status"
            >
              Employee
              {sortIndicator(
                'employee'
              )}
            </th>

            <th
              style={
                normalHeaderStyle
              }
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {sortedApplicants.length >
            0 ? (
            sortedApplicants.map(
              applicant => {
                const eligible =
                  isEligible(
                    applicant
                  )

                let selectionReason =
                  'Select applicant'

                if (
                  applicant.employee_id
                ) {
                  selectionReason =
                    'Applicant has already been converted to an employee'
                } else if (
                  !eligible
                ) {
                  selectionReason =
                    `Applicants with status ${applicant.status} cannot be converted`
                }

                return (
                  <tr
                    key={applicant.id}
                  >
                    <td
                      style={{
                        ...cellStyle,
                        textAlign:
                          'center'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(
                          applicant.id
                        )}
                        onChange={() =>
                          toggleApplicant(
                            applicant.id
                          )
                        }
                        disabled={
                          !eligible
                        }
                        title={
                          selectionReason
                        }
                      />
                    </td>

                    <td
                      style={cellStyle}
                    >
                      {
                        applicant.first_name
                      }
                    </td>

                    <td
                      style={cellStyle}
                    >
                      {
                        applicant.last_name
                      }
                    </td>

                    <td
                      style={cellStyle}
                    >
                      {applicant.email}
                    </td>

                    <td
                      style={cellStyle}
                    >
                      {applicant.role}
                    </td>

                    <td
                      style={cellStyle}
                    >
                      {applicant.status}
                    </td>

                    <td
                      style={cellStyle}
                    >
                      {applicant.employee_id
                        ? 'Yes'
                        : 'No'}
                    </td>

                    <td
                      style={cellStyle}
                    >
                      <Link
                        href={`/admin/applicants/${applicant.id}`}
                      >
                        Edit
                      </Link>

                      {applicant.employee_id && (
                        <>
                          {' | '}

                          <Link
                            href={`/admin/employees/${applicant.employee_id}`}
                          >
                            View Employee
                          </Link>
                        </>
                      )}
                    </td>
                  </tr>
                )
              }
            )
          ) : (
            <tr>
              <td
                colSpan={8}
                style={cellStyle}
              >
                No applicants found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}