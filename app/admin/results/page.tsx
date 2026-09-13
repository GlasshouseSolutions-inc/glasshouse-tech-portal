'use client'

import {
  useEffect,
  useMemo,
  useState
} from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

type Result = {
  id: string
  applicant_id: string | null
  test_id: string | null
  score: number | null
  pass_fail: string | null
  recommendation: string | null
  completed_at: string | null
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
  | 'score'
  | 'pass_fail'
  | 'recommendation'
  | 'completed_at'

type SortDirection =
  | 'asc'
  | 'desc'

function formatCompletedDate(
  timestamp: string
) {
  const parts =
    new Intl.DateTimeFormat(
      'en-US',
      {
        timeZone:
          'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }
    ).formatToParts(
      new Date(timestamp)
    )

  const year =
    parts.find(
      part =>
        part.type === 'year'
    )?.value

  const month =
    parts.find(
      part =>
        part.type === 'month'
    )?.value

  const day =
    parts.find(
      part =>
        part.type === 'day'
    )?.value

  return `${year}-${month}-${day}`
}

function nameCompare(
  a: string,
  b: string,
  direction: SortDirection
) {
  const result =
    a.localeCompare(
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

export default function ResultsPage() {
  const router =
    useRouter()

  const [
    results,
    setResults
  ] =
    useState<Result[]>([])

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
      'completed_at'
    )

  const [
    sortDirection,
    setSortDirection
  ] =
    useState<SortDirection>(
      'desc'
    )

  useEffect(() => {
    const loadResults =
      async () => {
        setLoading(true)
        setErrorMessage(null)

        const {
          data: resultData,
          error: resultError
        } =
          await supabase
            .from(
              'test_results'
            )
            .select(`
              id,
              applicant_id,
              test_id,
              score,
              pass_fail,
              recommendation,
              completed_at
            `)

        if (resultError) {
          setErrorMessage(
            resultError.message
          )

          setLoading(false)
          return
        }

        const {
          data: applicantData,
          error: applicantError
        } =
          await supabase
            .from(
              'applicants'
            )
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
        } =
          await supabase
            .from(
              'tests'
            )
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
          new Map<
            string,
            ApplicantRecord
          >()

        const applicants:
          ApplicantRecord[] =
          applicantData || []

        for (
          const applicant
          of applicants
        ) {
          applicantMap.set(
            applicant.id,
            applicant
          )
        }

        const testMap =
          new Map<
            string,
            string
          >()

        const tests:
          TestRecord[] =
          testData || []

        for (
          const test
          of tests
        ) {
          testMap.set(
            test.id,
            test.name
          )
        }

        const formatted: Result[] =
          (resultData || []).map(
            result => {
              const applicant =
                result.applicant_id
                  ? applicantMap.get(
                    result.applicant_id
                  )
                  : undefined

              return {
                ...result,

                applicant_first_name:
                  applicant?.first_name ||
                  'Unknown',

                applicant_last_name:
                  applicant?.last_name ||
                  'Unknown',

                test_name:
                  result.test_id
                    ? testMap.get(
                      result.test_id
                    ) ||
                    'Unknown'
                    : 'Unknown'
              }
            }
          )

        setResults(
          formatted
        )

        setLoading(false)
      }

    loadResults()
  }, [])

  const getSortValue = (
    result: Result,
    key: SortKey
  ) => {
    switch (key) {
      case 'first_name':
        return (
          result.applicant_first_name
        )

      case 'last_name':
        return (
          result.applicant_last_name
        )

      case 'test':
        return result.test_name

      case 'score':
        return result.score ?? -1

      case 'pass_fail':
        return (
          result.pass_fail || ''
        )

      case 'recommendation':
        return (
          result.recommendation ||
          ''
        )

      case 'completed_at':
        return result.completed_at
          ? new Date(
            result.completed_at
          ).getTime()
          : 0
    }
  }

  const sortedResults =
    useMemo(() => {
      return [...results].sort(
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
            typeof aValue ===
            'number' &&
            typeof bValue ===
            'number'
          ) {
            return (
              sortDirection ===
                'asc'
                ? aValue - bValue
                : bValue - aValue
            )
          }

          const comparison =
            String(
              aValue
            ).localeCompare(
              String(
                bValue
              ),
              undefined,
              {
                sensitivity:
                  'base'
              }
            )

          if (
            comparison !== 0
          ) {
            return (
              sortDirection ===
                'asc'
                ? comparison
                : -comparison
            )
          }

          if (
            sortKey ===
            'last_name'
          ) {
            return nameCompare(
              a.applicant_first_name,
              b.applicant_first_name,
              sortDirection
            )
          }

          if (
            sortKey ===
            'first_name'
          ) {
            return nameCompare(
              a.applicant_last_name,
              b.applicant_last_name,
              sortDirection
            )
          }

          return 0
        }
      )
    }, [
      results,
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
      '1px solid #eee'
  }

  if (loading) {
    return (
      <p>
        Loading results...
      </p>
    )
  }

  if (errorMessage) {
    return (
      <p>
        {errorMessage}
      </p>
    )
  }

  return (
    <div
      className="page-container"
    >
      <h1>
        Test Results
      </h1>

      {
        results.length === 0
          ? (
            <p>
              No results recorded yet.
            </p>
          )
          : (
            <div
              className="table-container"
            >
              <table>
                <thead>
                  <tr>
                    <th
                      style={
                        sortableHeaderStyle
                      }
                      onClick={() =>
                        handleSort(
                          'first_name'
                        )
                      }
                    >
                      First Name
                      {
                        sortIndicator(
                          'first_name'
                        )
                      }
                    </th>

                    <th
                      style={
                        sortableHeaderStyle
                      }
                      onClick={() =>
                        handleSort(
                          'last_name'
                        )
                      }
                    >
                      Last Name
                      {
                        sortIndicator(
                          'last_name'
                        )
                      }
                    </th>

                    <th
                      style={
                        sortableHeaderStyle
                      }
                      onClick={() =>
                        handleSort(
                          'test'
                        )
                      }
                    >
                      Test
                      {
                        sortIndicator(
                          'test'
                        )
                      }
                    </th>

                    <th
                      style={
                        sortableHeaderStyle
                      }
                      onClick={() =>
                        handleSort(
                          'score'
                        )
                      }
                    >
                      Score
                      {
                        sortIndicator(
                          'score'
                        )
                      }
                    </th>

                    <th
                      style={
                        sortableHeaderStyle
                      }
                      onClick={() =>
                        handleSort(
                          'pass_fail'
                        )
                      }
                    >
                      Pass / Fail
                      {
                        sortIndicator(
                          'pass_fail'
                        )
                      }
                    </th>

                    <th
                      style={
                        sortableHeaderStyle
                      }
                      onClick={() =>
                        handleSort(
                          'recommendation'
                        )
                      }
                    >
                      Recommendation
                      {
                        sortIndicator(
                          'recommendation'
                        )
                      }
                    </th>

                    <th
                      style={
                        sortableHeaderStyle
                      }
                      onClick={() =>
                        handleSort(
                          'completed_at'
                        )
                      }
                    >
                      Completed
                      {
                        sortIndicator(
                          'completed_at'
                        )
                      }
                    </th>

                    <th
                      style={
                        normalHeaderStyle
                      }
                    >
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {
                    sortedResults.map(
                      result => (
                        <tr
                          key={
                            result.id
                          }
                        >
                          <td
                            style={
                              cellStyle
                            }
                          >
                            {
                              result.applicant_first_name
                            }
                          </td>

                          <td
                            style={
                              cellStyle
                            }
                          >
                            {
                              result.applicant_last_name
                            }
                          </td>

                          <td
                            style={
                              cellStyle
                            }
                          >
                            {
                              result.test_name
                            }
                          </td>

                          <td
                            style={
                              cellStyle
                            }
                          >
                            {
                              result.score ??
                              '—'
                            }
                          </td>

                          <td
                            style={
                              cellStyle
                            }
                          >
                            {
                              result.pass_fail ??
                              '—'
                            }
                          </td>

                          <td
                            style={
                              cellStyle
                            }
                          >
                            {
                              result.recommendation ||
                              '—'
                            }
                          </td>

                          <td
                            style={
                              cellStyle
                            }
                          >
                            {
                              result.completed_at
                                ? formatCompletedDate(
                                  result.completed_at
                                )
                                : '—'
                            }
                          </td>

                          <td
                            style={
                              cellStyle
                            }
                          >
                            <button
                              className="btn-secondary"
                              onClick={() =>
                                router.push(
                                  `/admin/results/${result.id}`
                                )
                              }
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      )
                    )
                  }
                </tbody>
              </table>
            </div>
          )
      }
    </div>
  )
}