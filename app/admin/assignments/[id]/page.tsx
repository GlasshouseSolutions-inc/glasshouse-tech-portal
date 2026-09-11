// app/admin/assignments/[id]/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function EditAssignmentPage() {

  const router = useRouter()

  const { id } =
    useParams() as { id: string }


  const [assignment, setAssignment] =
    useState<any>(null)

  const [applicants, setApplicants] =
    useState<any[]>([])

  const [tests, setTests] =
    useState<any[]>([])

  const [attemptId, setAttemptId] =
    useState<string | null>(null)

  const [attemptStatus, setAttemptStatus] =
    useState<string | null>(null)

  const [loading, setLoading] =
    useState(true)



  const statuses =
    [
      'Assigned',
      'Started',
      'Completed'
    ]



  useEffect(() => {

    async function loadData() {


      const {
        data: assignmentData,
        error: assignmentError
      } =
        await supabase
          .from('assignments')
          .select('*')
          .eq('id', id)
          .single()



      if (assignmentError) {

        alert(
          assignmentError.message
        )

        router.push(
          '/admin/assignments'
        )

        return

      }



      setAssignment(
        assignmentData
      )



      const {
        data: applicantsData
      } =
        await supabase
          .from('applicants')
          .select('*')


      setApplicants(
        applicantsData || []
      )



      const {
        data: testsData
      } =
        await supabase
          .from('tests')
          .select('*')


      setTests(
        testsData || []
      )



      /*
        Find existing assessment attempt
      */

      const {
        data: attemptData
      } =
        await supabase
          .from('test_attempts')
          .select(
            `
        id,
        status
      `
          )
          .eq(
            'assignment_id',
            assignmentData.id
          )
          .maybeSingle()



      if (attemptData) {

        setAttemptId(
          attemptData.id
        )

        setAttemptStatus(
          attemptData.status
        )

      }



      setLoading(false)

    }



    loadData()


  }, [
    id,
    router
  ])




  function copyAssessmentLink() {

    if (!attemptId) {
      return
    }


    const url =
      `${window.location.origin}/assessment/${attemptId}`


    navigator.clipboard.writeText(
      url
    )


    alert(
      'Assessment link copied'
    )

  }






  async function handleDelete() {


    if (
      !confirm(
        'Are you sure you want to delete this assignment?'
      )
    ) {

      return

    }



    const {
      error
    } =
      await supabase
        .from('assignments')
        .delete()
        .eq(
          'id',
          id
        )



    if (error) {

      alert(
        error.message
      )

    }
    else {

      router.push(
        '/admin/assignments'
      )

    }

  }





  if (loading) {

    return (
      <p>
        Loading...
      </p>
    )

  }



  if (!assignment) {

    return (
      <p>
        Assignment not found.
      </p>
    )

  }





  return (

    <div>

      <h1>
        Edit Assignment
      </h1>



      {
        attemptId &&
        attemptStatus !== 'COMPLETED' &&
        (

          <div
            style={{
              marginBottom: '1rem'
            }}
          >

            <p>
              Assessment Status:
              {' '}
              {attemptStatus}
            </p>


            <button
              type="button"
              onClick={
                copyAssessmentLink
              }
            >

              Copy Assessment Link

            </button>

          </div>

        )

      }



      {
        !attemptId &&

        (

          <p>
            Assessment link not generated yet.
          </p>

        )

      }





      <div>


        <div>

          <label>
            Applicant
          </label>


          <select

            value={
              assignment.applicant_id
            }

            disabled

          >

            {
              applicants.map(
                (a) => (

                  <option
                    key={a.id}
                    value={a.id}
                  >

                    {a.first_name}
                    {' '}
                    {a.last_name}

                  </option>

                )
              )
            }

          </select>

        </div>





        <div>

          <label>
            Test
          </label>


          <select

            value={
              assignment.test_id
            }

            disabled

          >

            {
              tests.map(
                (t) => (

                  <option
                    key={t.id}
                    value={t.id}
                  >

                    {t.name}

                  </option>

                )
              )
            }

          </select>


        </div>





        <div>

          <label>
            Status
          </label>


          <select

            value={
              assignment.status
            }

            disabled

          >

            {
              statuses.map(
                (s) => (

                  <option
                    key={s}
                  >

                    {s}

                  </option>

                )
              )
            }

          </select>


        </div>







      </div>


    </div>

  )

}
