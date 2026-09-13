'use client'

import {
  useEffect,
  useState
} from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

type QuestionRecord = {
  id: string
  category_id: string | null
  question_type: string
  question_text: string
  category_name: string
}

type CategoryRecord = {
  id: string
  name: string
}

type SortKey =
  | 'category'
  | 'type'
  | 'question'

type SortDirection =
  | 'asc'
  | 'desc'

const PAGE_SIZE = 50

export default function QuestionsPage() {
  const [
    questions,
    setQuestions
  ] =
    useState<QuestionRecord[]>([])

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
      'category'
    )

  const [
    sortDirection,
    setSortDirection
  ] =
    useState<SortDirection>(
      'asc'
    )

  const [
    page,
    setPage
  ] =
    useState(1)

  const [
    totalCount,
    setTotalCount
  ] =
    useState(0)

  const [
    categoryMap,
    setCategoryMap
  ] =
    useState<Map<string, string>>(
      new Map()
    )

  useEffect(() => {
    const loadCategories =
      async () => {
        const {
          data,
          error
        } =
          await supabase
            .from(
              'assessment_categories'
            )
            .select(`
              id,
              name
            `)

        if (error) {
          setErrorMessage(
            error.message
          )
          return
        }

        const categories:
          CategoryRecord[] =
          data || []

        const map =
          new Map<
            string,
            string
          >()

        for (
          const category
          of categories
        ) {
          map.set(
            category.id,
            category.name
          )
        }

        setCategoryMap(
          map
        )
      }

    loadCategories()
  }, [])

  useEffect(() => {
    const loadQuestions =
      async () => {
        setLoading(true)
        setErrorMessage(null)

        const from =
          (page - 1) *
          PAGE_SIZE

        const to =
          from +
          PAGE_SIZE -
          1

        let query =
          supabase
            .from('questions')
            .select(
              `
                id,
                category_id,
                question_type,
                question_text
              `,
              {
                count: 'exact'
              }
            )

        if (
          sortKey === 'type'
        ) {
          query =
            query.order(
              'question_type',
              {
                ascending:
                  sortDirection ===
                  'asc'
              }
            )
        }

        if (
          sortKey === 'question'
        ) {
          query =
            query.order(
              'question_text',
              {
                ascending:
                  sortDirection ===
                  'asc'
              }
            )
        }

        if (
          sortKey === 'category'
        ) {
          query =
            query.order(
              'category_id',
              {
                ascending:
                  sortDirection ===
                  'asc'
              }
            )
        }

        const {
          data,
          error,
          count
        } =
          await query.range(
            from,
            to
          )

        if (error) {
          setErrorMessage(
            error.message
          )

          setLoading(false)
          return
        }

        const formatted:
          QuestionRecord[] =
          (data || []).map(
            question => ({
              ...question,

              category_name:
                question.category_id
                  ? categoryMap.get(
                    question.category_id
                  ) ||
                  'Unknown'
                  : 'Unknown'
            })
          )

        setQuestions(
          formatted
        )

        setTotalCount(
          count || 0
        )

        setLoading(false)
      }

    if (
      categoryMap.size > 0
    ) {
      loadQuestions()
    }
  }, [
    page,
    sortKey,
    sortDirection,
    categoryMap
  ])

  const handleSort = (
    key: SortKey
  ) => {
    setPage(1)

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

    setSortKey(key)
    setSortDirection('asc')
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

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalCount /
        PAGE_SIZE
      )
    )

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

  if (
    loading &&
    questions.length === 0
  ) {
    return (
      <p>
        Loading questions...
      </p>
    )
  }

  if (errorMessage) {
    return (
      <p>
        Error loading questions:
        {' '}
        {errorMessage}
      </p>
    )
  }

  return (
    <div>
      <h1>
        Questions
      </h1>

      <Link
        href="/admin/questions/new"
        style={{
          color: '#FE5000',
          fontWeight: 'bold'
        }}
      >
        + New Question
      </Link>

      <div
        style={{
          marginTop: '1rem',
          marginBottom: '0.75rem'
        }}
      >
        Showing
        {' '}
        {
          totalCount === 0
            ? 0
            : (
              (page - 1) *
              PAGE_SIZE
            ) + 1
        }
        {' '}
        -
        {' '}
        {
          Math.min(
            page *
            PAGE_SIZE,
            totalCount
          )
        }
        {' '}
        of
        {' '}
        {totalCount}
        {' '}
        questions
      </div>

      <table
        style={{
          width: '100%',
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
                  'type'
                )
              }
            >
              Type
              {
                sortIndicator(
                  'type'
                )
              }
            </th>

            <th
              style={
                sortableHeaderStyle
              }
              onClick={() =>
                handleSort(
                  'question'
                )
              }
            >
              Question
              {
                sortIndicator(
                  'question'
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
            questions.length > 0
              ? (
                questions.map(
                  question => (
                    <tr
                      key={
                        question.id
                      }
                    >
                      <td
                        style={
                          cellStyle
                        }
                      >
                        {
                          question.category_name
                        }
                      </td>

                      <td
                        style={
                          cellStyle
                        }
                      >
                        {
                          question.question_type
                        }
                      </td>

                      <td
                        style={
                          cellStyle
                        }
                      >
                        {
                          question.question_text
                        }
                      </td>

                      <td
                        style={
                          cellStyle
                        }
                      >
                        <Link
                          href={
                            `/admin/questions/${question.id}`
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
                    No questions found.
                  </td>
                </tr>
              )
          }
        </tbody>
      </table>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginTop: '1rem',
          flexWrap: 'wrap'
        }}
      >
        <button
          className="btn-secondary"
          disabled={
            page <= 1 ||
            loading
          }
          onClick={() =>
            setPage(1)
          }
        >
          Home
        </button>

        <button
          className="btn-secondary"
          disabled={
            page <= 1 ||
            loading
          }
          onClick={() =>
            setPage(
              current =>
                Math.max(
                  1,
                  current - 1
                )
            )
          }
        >
          Previous
        </button>

        <span>
          Page
        </span>

        <select
          value={page}
          disabled={loading}
          onChange={event =>
            setPage(
              Number(
                event.target.value
              )
            )
          }
        >
          {
            Array.from(
              {
                length:
                  totalPages
              },
              (_, index) =>
                index + 1
            ).map(
              pageNumber => (
                <option
                  key={
                    pageNumber
                  }
                  value={
                    pageNumber
                  }
                >
                  {pageNumber}
                </option>
              )
            )
          }
        </select>

        <span>
          of
          {' '}
          {totalPages}
        </span>

        <button
          className="btn-secondary"
          disabled={
            page >=
            totalPages ||
            loading
          }
          onClick={() =>
            setPage(
              current =>
                Math.min(
                  totalPages,
                  current + 1
                )
            )
          }
        >
          Next
        </button>

        <button
          className="btn-secondary"
          disabled={
            page >=
            totalPages ||
            loading
          }
          onClick={() =>
            setPage(
              totalPages
            )
          }
        >
          End
        </button>
      </div>
    </div>
  )
}