'use client'

import {
  useEffect,
  useMemo,
  useState
} from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

type TestRecord = {
  id: string
  name: string
  category: string | null
  description: string | null
}

type SortKey =
  | 'name'
  | 'category'
  | 'description'

type SortDirection =
  | 'asc'
  | 'desc'

export default function TestsPage() {
  const [
    tests,
    setTests
  ] =
    useState<TestRecord[]>([])

  const [
    loading,
    setLoading
  ] =
    useState(true)

  const [
    errorMessage,
    setErrorMessage
  ] =
    useState<string | null>(
      null
    )

  const [
    sortKey,
    setSortKey
  ] =
    useState<SortKey>(
      'name'
    )

  const [
    sortDirection,
    setSortDirection
  ] =
    useState<SortDirection>(
      'asc'
    )

  useEffect(() => {
    const loadTests =
      async () => {
        setLoading(true)
        setErrorMessage(null)

        const {
          data,
          error
        } =
          await supabase
            .from('tests')
            .select(`
              id,
              name,
              category,
              description
            `)

        if (error) {
          setErrorMessage(
            error.message
          )

          setLoading(false)
          return
        }

        setTests(
          data || []
        )

        setLoading(false)
      }

    loadTests()
  }, [])

  const sortedTests =
    useMemo(() => {
      return [...tests].sort(
        (a, b) => {
          let aValue = ''
          let bValue = ''

          switch (sortKey) {
            case 'name':
              aValue =
                a.name || ''

              bValue =
                b.name || ''

              break

            case 'category':
              aValue =
                a.category || ''

              bValue =
                b.category || ''

              break

            case 'description':
              aValue =
                a.description || ''

              bValue =
                b.description || ''

              break
          }

          const comparison =
            aValue.localeCompare(
              bValue,
              undefined,
              {
                sensitivity:
                  'base'
              }
            )

          return (
            sortDirection ===
              'asc'
              ? comparison
              : -comparison
          )
        }
      )
    }, [
      tests,
      sortKey,
      sortDirection
    ])

  const handleSort = (
    key: SortKey
  ) => {
    if (
      sortKey === key
    ) {
      setSortDirection(
        current =>
          current === 'asc'
            ? 'desc'
            : 'asc'
      )

      return
    }

    setSortKey(
      key
    )

    setSortDirection(
      'asc'
    )
  }

  const sortIndicator = (
    key: SortKey
  ) => {
    if (
      sortKey !== key
    ) {
      return ' ↕'
    }

    return (
      sortDirection ===
        'asc'
        ? ' ▲'
        : ' ▼'
    )
  }

  const sortableHeaderStyle = {
    textAlign:
      'left' as const,
    padding: '0.5rem',
    borderBottom:
      '1px solid #ccc',
    cursor: 'pointer',
    userSelect:
      'none' as const
  }

  const normalHeaderStyle = {
    textAlign:
      'left' as const,
    padding: '0.5rem',
    borderBottom:
      '1px solid #ccc'
  }

  const cellStyle = {
    padding: '0.5rem',
    borderBottom:
      '1px solid #ccc'
  }

  if (loading) {
    return (
      <p>
        Loading tests...
      </p>
    )
  }

  if (errorMessage) {
    return (
      <p>
        Error loading tests:
        {' '}
        {errorMessage}
      </p>
    )
  }

  return (
    <div>
      <h1>
        Tests
      </h1>

      <Link
        href="/admin/tests/new"
        style={{
          color: '#FE5000',
          fontWeight: 'bold'
        }}
      >
        + New Test
      </Link>

      <table
        style={{
          width: '100%',
          marginTop: '1rem',
          borderCollapse:
            'collapse'
        }}
      >
        <thead>
          <tr>
            <th
              style={
                sortableHeaderStyle
              }
              onClick={() =>
                handleSort(
                  'name'
                )
              }
            >
              Name
              {
                sortIndicator(
                  'name'
                )
              }
            </th>

            <th
              style={
                sortableHeaderStyle
              }
              onClick={() =>
                handleSort(
                  'category'
                )
              }
            >
              Category
              {
                sortIndicator(
                  'category'
                )
              }
            </th>

            <th
              style={
                sortableHeaderStyle
              }
              onClick={() =>
                handleSort(
                  'description'
                )
              }
            >
              Description
              {
                sortIndicator(
                  'description'
                )
              }
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
          {
            sortedTests.length >
              0
              ? (
                sortedTests.map(
                  test => (
                    <tr
                      key={
                        test.id
                      }
                    >
                      <td
                        style={
                          cellStyle
                        }
                      >
                        {
                          test.name
                        }
                      </td>

                      <td
                        style={
                          cellStyle
                        }
                      >
                        {
                          test.category ||
                          '—'
                        }
                      </td>

                      <td
                        style={
                          cellStyle
                        }
                      >
                        {
                          test.description ||
                          '—'
                        }
                      </td>

                      <td
                        style={
                          cellStyle
                        }
                      >
                        <Link
                          href={
                            `/admin/tests/${test.id}`
                          }
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  )
                )
              )
              : (
                <tr>
                  <td
                    colSpan={4}
                    style={
                      cellStyle
                    }
                  >
                    No tests found.
                  </td>
                </tr>
              )
          }
        </tbody>
      </table>
    </div>
  )
}