'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

type Assignment = {
  id: string
  applicant_id: string
  test_id: string
  difficulty: string | null
  question_count: number | null
  purpose: string | null
  status: string
  assigned_at: string | null
  applicant_first_name: string
  applicant_last_name: string
  test_name: string
}

type ApplicantRecord = {
  id: string
  first_name: string
  last_name: string
}

type TestRecord = {
  id: string
  name: string
}

type SortKey =
  | 'first_name'
  | 'last_name'
  | 'test'
  | 'difficulty'
  | 'questions'
  | 'purpose'
  | 'status'

type SortDirection = 'asc' | 'desc'

export default function AssignmentsPage() {
  const [assignments, setAssignments] =
    useState<Assignment[]>([])

  const [loading, setLoading] =
    useState(true)

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  const [sortKey, setSortKey] =
    useState<SortKey>('last_name')

  const [sortDirection, setSortDirection] =
    useState<SortDirection>('asc')

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true)
      setErrorMessage(null)

      const {
        data: assignmentData,
        error: assignmentError
      } = await supabase
        .from('assignments')
        .select(`
          id,
          applicant_id,
          test_id,
          difficulty,
          question_count,
          purpose,
          status,
          assigned_at
        `)

      if (assignmentError) {
        setErrorMessage(
          assignmentError.message
        )
        setLoading(false)
        return
      }

      const {
        data: applicantData,
        error: applicantError
      } = await supabase
        .from('applicants')
        .select(`
          id,
          first_name,
          last_name
        `)

      if (applicantError) {
        setErrorMessage(
          applicantError.message
        )
        setLoading(false)
        return
      }

      const {
        data: testData,
        error: testError
      } = await supabase
        .from('tests')
        .select(`
          id,
          name
        `)

      if (testError) {
        setErrorMessage(
          testError.message
        )
        setLoading(false)
        return
      }

      const applicantMap =
        new Map<string, ApplicantRecord>()

      for (
        const applicant
        of (applicantData || []) as ApplicantRecord[]
      ) {
        applicantMap.set(
          applicant.id,
          applicant
        )
      }

      const testMap =
        new Map<string, string>()

      for (
        const test
        of (testData || []) as TestRecord[]
      ) {
        testMap.set(
          test.id,
          test.name
        )
      }

      const combinedAssignments: Assignment[] =
        (assignmentData || []).map(
          assignment => {
            const applicant =
              applicantMap.get(
                assignment.applicant_id
              )

            return {
              ...assignment,
              applicant_first_name:
                applicant?.first_name || '—',
              applicant_last_name:
                applicant?.last_name || '—',
              test_name:
                testMap.get(
                  assignment.test_id
                ) || '—'
            }
          }
        )

      setAssignments(
        combinedAssignments
      )

      setLoading(false)
    }

    fetchAssignments()
  }, [])

  const getSortValue = (
    assignment: Assignment,
    key: SortKey
  ) => {
    switch (key) {
      case 'first_name':
        return assignment.applicant_first_name

      case 'last_name':
        return assignment.applicant_last_name

      case 'test':
        return assignment.test_name

      case 'difficulty':
        return assignment.difficulty || ''

      case 'questions':
        return assignment.question_count ?? -1

      case 'purpose':
        return assignment.purpose || ''

      case 'status':
        return assignment.status || ''
    }
  }

  const sortedAssignments =
    useMemo(() => {
      return [...assignments].sort(
        (a, b) => {
          const aValue =
            getSortValue(
              a,
              sortKey
            )

          const bValue =
            getSortValue(
              b,
              sortKey
            )

          if (
            typeof aValue === 'number' &&
            typeof bValue === 'number'
          ) {
            return sortDirection === 'asc'
              ? aValue - bValue
              : bValue - aValue
          }

          const result =
            String(aValue).localeCompare(
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
            return assignmentNameCompare(
              a.applicant_first_name,
              b.applicant_first_name,
              sortDirection
            )
          }

          if (sortKey === 'first_name') {
            return assignmentNameCompare(
              a.applicant_last_name,
              b.applicant_last_name,
              sortDirection
            )
          }

          return 0
        }
      )
    }, [
      assignments,
      sortKey,
      sortDirection
    ])

  const handleSort = (
    key: SortKey
  ) => {
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

  const sortIndicator = (
    key: SortKey
  ) => {
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
    borderBottom: '1px solid #eee'
  }

  if (loading) {
    return (
      <p>Loading assignments...</p>
    )
  }

  if (errorMessage) {
    return (
      <p>{errorMessage}</p>
    )
  }

  return (
    <div>
      <h1>Assignments</h1>

      <Link href="/admin/assignments/new">
        + New Assignment
      </Link>

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
                handleSort('test')
              }
              title="Sort by test"
            >
              Test
              {sortIndicator('test')}
            </th>

            <th
              style={sortableHeaderStyle}
              onClick={() =>
                handleSort('difficulty')
              }
              title="Sort by difficulty"
            >
              Difficulty
              {sortIndicator('difficulty')}
            </th>

            <th
              style={sortableHeaderStyle}
              onClick={() =>
                handleSort('questions')
              }
              title="Sort by question count"
            >
              Questions
              {sortIndicator('questions')}
            </th>

            <th
              style={sortableHeaderStyle}
              onClick={() =>
                handleSort('purpose')
              }
              title="Sort by purpose"
            >
              Purpose
              {sortIndicator('purpose')}
            </th>

            <th
              style={sortableHeaderStyle}
              onClick={() =>
                handleSort('status')
              }
              title="Sort by status"
            >
              Status
              {sortIndicator('status')}
            </th>

            <th style={normalHeaderStyle}>
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {sortedAssignments.length > 0 ? (
            sortedAssignments.map(
              assignment => (
                <tr key={assignment.id}>
                  <td style={cellStyle}>
                    {
                      assignment.applicant_first_name
                    }
                  </td>

                  <td style={cellStyle}>
                    {
                      assignment.applicant_last_name
                    }
                  </td>

                  <td style={cellStyle}>
                    {assignment.test_name}
                  </td>

                  <td style={cellStyle}>
                    {assignment.difficulty ||
                      '—'}
                  </td>

                  <td style={cellStyle}>
                    {assignment.question_count ??
                      '—'}
                  </td>

                  <td style={cellStyle}>
                    {assignment.purpose ||
                      '—'}
                  </td>

                  <td style={cellStyle}>
                    {assignment.status}
                  </td>

                  <td style={cellStyle}>
                    <Link
                      href={`/admin/assignments/${assignment.id}`}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              )
            )
          ) : (
            <tr>
              <td
                colSpan={8}
                style={cellStyle}
              >
                No assignments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function assignmentNameCompare(
  a: string,
  b: string,
  direction: SortDirection
) {
  const result = a.localeCompare(
    b,
    undefined,
    {
      sensitivity: 'base'
    }
  )

  return direction === 'asc'
    ? result
    : -result
}