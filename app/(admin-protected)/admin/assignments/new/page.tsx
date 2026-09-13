// app/admin/assignments/new/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function NewAssignmentPage() {
  const router = useRouter()

  const [applicants, setApplicants] = useState<any[]>([])
  const [tests, setTests] = useState<any[]>([])

  const [applicantId, setApplicantId] = useState('')
  const [testId, setTestId] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [questionCount, setQuestionCount] = useState('')
  const [purpose, setPurpose] = useState('')

  const [loading, setLoading] = useState(false)


  useEffect(() => {

    async function loadData() {

      const { data: applicantsData } =
        await supabase
          .from('applicants')
          .select('*')
          .order('last_name')


      const { data: testsData } =
        await supabase
          .from('tests')
          .select('*')
          .order('name')


      setApplicants(applicantsData || [])
      setTests(testsData || [])

    }


    loadData()

  }, [])



  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault()


    if (
      !applicantId ||
      !testId ||
      !difficulty ||
      !questionCount ||
      !purpose
    ) {

      alert(
        'Please complete all assignment fields'
      )

      return

    }


    const parsedQuestionCount =
      Number(questionCount)


    if (
      !Number.isInteger(parsedQuestionCount) ||
      parsedQuestionCount <= 0
    ) {

      alert(
        'Question count must be greater than zero'
      )

      return

    }


    setLoading(true)



    /*
      Step 1:
      Create assignment with generation settings
    */


    const {
      data: assignment,
      error: assignmentError
    } = await supabase
      .from('assignments')
      .insert([
        {
          applicant_id:
            applicantId,

          test_id:
            testId,

          status:
            'Assigned',

          assigned_at:
            new Date().toISOString(),

          difficulty:
            difficulty,

          question_count:
            parsedQuestionCount,

          purpose:
            purpose
        }
      ])
      .select()
      .single()



    if (assignmentError || !assignment) {

      alert(
        assignmentError?.message ||
        'Unable to create assignment'
      )

      setLoading(false)

      return

    }



    /*
      Step 2:
      Create linked test attempt
    */


    const {
      data: attempt,
      error: attemptError
    } = await supabase
      .from('test_attempts')
      .insert([
        {
          assignment_id:
            assignment.id,

          applicant_id:
            applicantId,

          test_id:
            testId,

          status:
            'ASSIGNED'
        }
      ])
      .select()
      .single()



    if (attemptError || !attempt) {

      alert(
        attemptError?.message ||
        'Unable to create test attempt'
      )

      setLoading(false)

      return

    }



    /*
      Step 3:
      Generate assessment questions
    */


    const {
      error: generationError
    } = await supabase.rpc(
      'generate_attempt_questions',
      {
        p_attempt_id:
          attempt.id
      }
    )



    if (generationError) {

      alert(
        generationError.message
      )

      setLoading(false)

      return

    }



    alert(
      'Assignment created and assessment generated'
    )


    router.push(
      '/admin/assignments'
    )

  }



  return (

    <div>

      <h1>
        New Assignment
      </h1>


      <form onSubmit={handleSubmit}>


        <div>

          <label>
            Applicant
          </label>


          <select
            value={applicantId}
            onChange={(e) =>
              setApplicantId(
                e.target.value
              )
            }
          >

            <option value="">
              Select Applicant
            </option>


            {
              applicants.map(
                (applicant: any) => (

                  <option
                    key={applicant.id}
                    value={applicant.id}
                  >

                    {applicant.first_name}
                    {' '}
                    {applicant.last_name}

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
            value={testId}
            onChange={(e) =>
              setTestId(
                e.target.value
              )
            }
          >

            <option value="">
              Select Test
            </option>


            {
              tests.map(
                (test: any) => (

                  <option
                    key={test.id}
                    value={test.id}
                  >

                    {test.name}

                  </option>

                )
              )
            }


          </select>

        </div>



        <div>

          <label>
            Difficulty
          </label>


          <select
            value={difficulty}
            onChange={(e) =>
              setDifficulty(
                e.target.value
              )
            }
          >

            <option value="">
              Select Difficulty
            </option>

            <option value="Easy">
              Easy
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="Hard">
              Hard
            </option>

          </select>

        </div>



        <div>

          <label>
            Question Count
          </label>


          <select
            value={questionCount}
            onChange={(e) =>
              setQuestionCount(
                e.target.value
              )
            }
          >

            <option value="">
              Select Question Count
            </option>

            <option value="10">
              10
            </option>

            <option value="15">
              15
            </option>

            <option value="25">
              25
            </option>

            <option value="50">
              50
            </option>

          </select>

        </div>



        <div>

          <label>
            Purpose
          </label>


          <select
            value={purpose}
            onChange={(e) =>
              setPurpose(
                e.target.value
              )
            }
          >

            <option value="">
              Select Purpose
            </option>

            <option value="Applicant Screening">
              Applicant Screening
            </option>

            <option value="Employee Knowledge Evaluation">
              Employee Knowledge Evaluation
            </option>

            <option value="Training Assessment">
              Training Assessment
            </option>

            <option value="Certification Evaluation">
              Certification Evaluation
            </option>

            <option value="Community Demonstration">
              Community Demonstration
            </option>

          </select>

        </div>



        <button
          type="submit"
          disabled={loading}
        >

          {
            loading
              ? 'Creating...'
              : 'Create Assignment'
          }

        </button>


      </form>


    </div>

  )

}