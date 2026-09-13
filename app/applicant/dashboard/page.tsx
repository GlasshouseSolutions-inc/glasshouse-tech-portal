// app/applicant/dashboard/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

type Assignment = {
  id: string
  status: string
  assigned_at: string
  test_title?: string
  attempt_id?: string
  attempt_status?: string
}

function formatAssignedDate(
  timestamp: string
) {
  const parts =
    new Intl.DateTimeFormat(
      'en-US',
      {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }
    ).formatToParts(
      new Date(timestamp)
    )

  const year =
    parts.find(
      part => part.type === 'year'
    )?.value

  const month =
    parts.find(
      part => part.type === 'month'
    )?.value

  const day =
    parts.find(
      part => part.type === 'day'
    )?.value

  return `${year}-${month}-${day}`
}

export default function DashboardPage() {
  const router = useRouter()

  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)


  async function loadAssignments() {

    setLoading(true)


    const {
      data: { user }
    } = await supabase.auth.getUser()

    console.log('AUTH USER:', user)

    if (!user) {
      router.push('/applicant/login')
      return
    }



    const { data: applicant, error: applicantError } =
      await supabase
        .from('applicants')
        .select('id')
        .eq('email', user.email)
        .single()

    if (applicantError || !applicant) {
      alert('Applicant record not found.')
      setLoading(false)
      return
    }

    const { data, error } =
      await supabase
        .from('assignments')
        .select(`
      id,
      status,
      assigned_at,
      test:test_id (
        name
      ),
      attempt:test_attempts (
        id,
        status
      )
    `)
        .eq(
          'applicant_id',
          applicant.id
        )



    if (error) {

      alert(error.message)

      setLoading(false)

      return

    }



    const formatted =
      (data || []).map(
        (a: any) => ({
          id: a.id,
          status: a.status,
          assigned_at: a.assigned_at,
          test_title:
            a.test?.name ||
            'Unknown Test',
          attempt_id:
            a.attempt?.[0]?.id,
          attempt_status:
            a.attempt?.[0]?.status
        })
      )


    setAssignments(formatted)

    setLoading(false)

  }



  useEffect(() => {

    loadAssignments()

  }, [])



  if (loading) {

    return (
      <p>
        Loading...
      </p>
    )

  }



  return (

    <div className="page-container">

      <h1>
        Your Dashboard
      </h1>


      {
        assignments.length === 0

          ?

          (
            <p>
              No assigned tests yet.
            </p>
          )

          :

          (

            <table className="table-container">

              <thead>

                <tr>

                  <th>
                    Test
                  </th>



                  <th>
                    Status
                  </th>

                  <th>
                    Assigned
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {
                  assignments.map(
                    (a) => (

                      <tr key={a.id}>

                        <td>
                          {a.test_title}
                        </td>


                        <td>
                          {a.status}
                        </td>


                        <td>
                          {
                            a.assigned_at
                              ? formatAssignedDate(
                                a.assigned_at
                              )
                              : ''
                          }
                        </td>

                        <td>
                          {
                            a.attempt_id &&
                              a.attempt_status !== "COMPLETED"
                              ?
                              (
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/assessment/${a.attempt_id}`
                                    )
                                  }
                                >
                                  Start Assessment
                                </button>
                              )
                              :
                              a.attempt_status === "COMPLETED"
                                ?
                                (
                                  'Completed'
                                )
                                :
                                (
                                  'Unavailable'
                                )
                          }
                        </td>

                      </tr>

                    )
                  )
                }

              </tbody>

            </table>

          )
      }



    </div>

  )

}