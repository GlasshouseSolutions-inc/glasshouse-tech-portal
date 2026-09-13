// app/admin/results/[id]/page.tsx

import { supabase } from '@/lib/supabase/client'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ResultDetailsPage({
  params,
}: PageProps) {

  const { id } = await params


  const {
    data: result,
    error
  } = await supabase
    .from('test_results')
    .select(`
      id,
      attempt_id,
      score,
      pass_fail,
      recommendation,
      completed_at,
      applicant:applicant_id (
        id,
        first_name,
        last_name
      ),
      test:test_id (
        id,
        name
      )
    `)
    .eq(
      'id',
      id
    )
    .single()


  if (
    error ||
    !result
  ) {

    console.error(
      'Result lookup failed:',
      error
    )

    return (
      <div>

        <h1>
          Assessment Result
        </h1>

        <p>
          Result not found.
        </p>

      </div>
    )

  }


  const applicant =
    result.applicant as any

  const test =
    result.test as any


  const applicantName =
    applicant
      ? `${applicant.first_name} ${applicant.last_name}`
      : 'Unknown'


  const testName =
    test
      ? test.name
      : 'Unknown'


  return (

    <div>

      <h1>
        Assessment Result
      </h1>


      <div
        style={{
          backgroundColor:
            'white',

          border:
            '1px solid #ddd',

          borderRadius:
            '8px',

          padding:
            '1.5rem',

          maxWidth:
            '700px'
        }}
      >

        <p>
          <strong>
            Applicant:
          </strong>{' '}
          {applicantName}
        </p>


        <p>
          <strong>
            Test:
          </strong>{' '}
          {testName}
        </p>


        <p>
          <strong>
            Score:
          </strong>{' '}
          {
            result.score ??
            'Not scored'
          }
        </p>


        <p>
          <strong>
            Pass / Fail:
          </strong>{' '}
          {
            result.pass_fail ??
            'Not available'
          }
        </p>


        <p>
          <strong>
            Recommendation:
          </strong>{' '}
          {
            result.recommendation ??
            'Not available'
          }
        </p>


        <p>
          <strong>
            Completed:
          </strong>{' '}
          {
            result.completed_at ??
            'Unknown'
          }
        </p>


        <p>
          <strong>
            Result ID:
          </strong>{' '}
          {result.id}
        </p>


        <p>
          <strong>
            Attempt ID:
          </strong>{' '}
          {
            result.attempt_id ??
            'Unknown'
          }
        </p>

      </div>

    </div>

  )

}