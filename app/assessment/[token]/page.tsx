//app/assessment/[token]/page.tsx

'use client'

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

export default function AssessmentPage({ params }: PageProps) {

  const [attemptId, setAttemptId] = useState("");
  const [testName, setTestName] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [hasStartedAnswering, setHasStartedAnswering] = useState(false);
  const [loading, setLoading] = useState(true);


  function updateAnsweredCount() {

    const inputs =
      document.querySelectorAll(
        "#assessment-form input[type='radio']:checked, #assessment-form textarea"
      );


    let count = 0;


    inputs.forEach((input: any) => {

      if (input.value.trim() !== "") {
        count++;
      }

    });


    setAnsweredCount(count);

  }



  function saveAnswers() {

    if (!attemptId) {
      return;
    }


    const form =
      document.getElementById(
        "assessment-form"
      ) as HTMLFormElement;


    if (!form) {
      return;
    }


    const data: any = {};


    Array.from(form.elements)
      .forEach((element: any) => {


        if (
          !element.name ||
          element.type === "hidden"
        ) {
          return;
        }


        if (element.type === "radio") {

          if (element.checked) {

            data[element.name] =
              element.value;

          }

        } else {

          data[element.name] =
            element.value;

        }

      });


    localStorage.setItem(
      `assessment_answers_${attemptId}`,
      JSON.stringify(data)
    );

  }



  function restoreAnswers() {

    if (!attemptId) {
      return;
    }


    const saved =
      localStorage.getItem(
        `assessment_answers_${attemptId}`
      );


    if (!saved) {
      return;
    }


    const answers =
      JSON.parse(saved);



    Object.keys(answers)
      .forEach(questionId => {


        const value =
          answers[questionId];


        const radios =
          document.querySelectorAll(
            `input[name="${questionId}"]`
          );


        if (radios.length) {


          radios.forEach(
            (radio: any) => {

              if (radio.value === value) {

                radio.checked = true;

              }

            }
          );


        } else {


          const textarea =
            document.querySelector(
              `textarea[name="${questionId}"]`
            ) as HTMLTextAreaElement;


          if (textarea) {

            textarea.value =
              value;

          }

        }

      });


    updateAnsweredCount();

  }



  function formatTime(seconds: number) {

    const minutes =
      Math.floor(seconds / 60);


    const secs =
      seconds % 60;


    return `${minutes
      .toString()
      .padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;

  }




  useEffect(() => {

    let interval: NodeJS.Timeout;


    async function loadAssessment() {


      const { token } =
        await params;


      setAttemptId(token);



      const { data: attempt, error: attemptError } =
        await supabase
          .from("test_attempts")
          .select(`
  applicant_id,
  test_id,
  assignment_id,
  status,
  started_at
`)
          .eq(
            "id",
            token
          )
          .single();



      if (attemptError || !attempt) {

        console.error(
          "Attempt load failed:",
          attemptError
        );

        return;

      }


      if (attempt.status === "COMPLETED") {

        window.location.href =
          "/assessment/complete";

        return;

      }



      const { data: test, error: testError } =
        await supabase
          .from("tests")
          .select(`
  name,
  time_limit_minutes
`)
          .eq(
            "id",
            attempt.test_id
          )
          .single();



      if (testError || !test) {

        console.error(
          "Test load failed:",
          testError
        );

        return;

      }



      setTestName(
        test.name
      );




      let startedAt =
        attempt.started_at;



      if (!startedAt) {

        const now =
          new Date().toISOString();



        const { error: startError } =
          await supabase
            .from("test_attempts")
            .update({
              started_at: now,
              status: "IN_PROGRESS"
            })
            .eq(
              "id",
              token
            );


        const { error: assignmentStartError } =
          await supabase
            .from("assignments")
            .update({
              started_at: now,
              status: "Started"
            })
            .eq(
              "id",
              attempt.assignment_id
            );

        if (assignmentStartError) {
          console.error(assignmentStartError);
          return;
        }



        if (startError) {

          console.error(startError);
          return;

        }


        startedAt = now;

      }



      const started =
        new Date(startedAt).getTime();



      const durationMinutes =
        Number(
          test.time_limit_minutes ?? 60
        );



      const expires =
        started +
        durationMinutes * 60 * 1000;



      function updateTimer() {

        const seconds =
          Math.max(
            0,
            Math.floor(
              (expires - Date.now()) / 1000
            )
          );


        setRemainingSeconds(seconds);



        if (seconds === 0) {

          const form =
            document.getElementById(
              "assessment-form"
            ) as HTMLFormElement;


          if (form) {

            form.submit();

          }

        }

      }


      updateTimer();


      interval =
        setInterval(
          updateTimer,
          1000
        );



      const { data: attemptQuestions, error } =
        await supabase
          .from("attempt_questions")
          .select(`
            display_order,
            question_id
          `)
          .eq(
            "attempt_id",
            token
          )
          .order(
            "display_order"
          );



      if (error) {

        console.error(error);
        return;

      }



      const questionIds =
        attemptQuestions.map(
          q => q.question_id
        );



      const { data: questionData } =
        await supabase
          .from("questions")
          .select(`
            id,
            question_text,
            question_type,
            choice_a,
            choice_b,
            choice_c,
            choice_d
          `)
          .in(
            "id",
            questionIds
          );



      const merged =
        attemptQuestions.map(
          aq => ({
            ...aq,
            question:
              questionData?.find(
                q =>
                  q.id === aq.question_id
              )
          })
        );



      setQuestions(
        merged
      );


      setLoading(false);


    }



    loadAssessment();



    return () => {

      if (interval) {

        clearInterval(interval);

      }

    };


  }, [params]);





  /*
    Restore saved answers
  */

  useEffect(() => {

    if (
      questions.length === 0 ||
      !attemptId
    ) {
      return;
    }


    const timer =
      setTimeout(() => {

        restoreAnswers();

      }, 500);



    return () => {

      clearTimeout(timer);

    };


  }, [
    questions,
    attemptId
  ]);





  /*
    Browser close warning
  */

  useEffect(() => {


    function preventLeave(
      e: BeforeUnloadEvent
    ) {

      if (!hasStartedAnswering) {

        return;

      }


      e.preventDefault();

      e.returnValue = "";

    }



    window.addEventListener(
      "beforeunload",
      preventLeave
    );



    return () => {

      window.removeEventListener(
        "beforeunload",
        preventLeave
      );

    };


  }, [
    hasStartedAnswering
  ]);





  if (loading) {

    return (

      <p>
        Loading assessment...
      </p>

    );

  }





  return (

    <div className="assessment-container">


      <div className="assessment-header">


        <h1 className="assessment-title">
          {testName}
        </h1>



        <div className="assessment-progress">


          <div>

            Questions Answered:
            {" "}
            {answeredCount}
            /
            {questions.length}

          </div>



          <div className="progress-track">

            <div

              className="progress-fill"

              style={{
                width:
                  `${questions.length === 0
                    ? 0
                    :
                    (
                      answeredCount /
                      questions.length
                    ) * 100
                  }%`
              }}

            />

          </div>


        </div>




        <div className="assessment-timer">

          Time Remaining:
          {" "}
          {formatTime(
            remainingSeconds
          )}

        </div>


      </div>





      <form

        id="assessment-form"

        action="/api/assessments/submit"

        method="POST"

        onChange={() => {

          setHasStartedAnswering(true);

          updateAnsweredCount();

          saveAnswers();

        }}

        onInput={() => {

          setHasStartedAnswering(true);

          updateAnsweredCount();

          saveAnswers();

        }}

      >



        <input

          type="hidden"

          name="attempt_id"

          value={attemptId}

        />





        {questions.map(

          (item, index) => {


            const q =
              item.question;



            if (!q) {

              return (

                <div

                  key={index}

                  className="question-card"

                >

                  Missing question:
                  {" "}
                  {item.question_id}

                </div>

              );

            }



            return (

              <div

                key={q.id}

                className="question-card"

              >



                <div className="question-number">

                  Question {item.display_order}

                </div>



                <div className="question-text">

                  {q.question_text}

                </div>





                {
                  q.question_type === "Multiple Choice"
                  &&
                  (

                    <div className="choice-list">


                      {[
                        {
                          key: "A",
                          value: q.choice_a
                        },
                        {
                          key: "B",
                          value: q.choice_b
                        },
                        {
                          key: "C",
                          value: q.choice_c
                        },
                        {
                          key: "D",
                          value: q.choice_d
                        }

                      ]

                        .filter(
                          option =>
                            option.value
                        )

                        .map(

                          option => (

                            <label

                              key={option.key}

                              className="choice-option"

                            >


                              <input

                                type="radio"

                                name={q.id}

                                value={option.value}

                              />



                              <span className="choice-label">

                                {option.key}.
                                {" "}
                                {option.value}

                              </span>


                            </label>

                          )

                        )}


                    </div>

                  )

                }







                {
                  q.question_type === "Short Answer"

                  &&

                  (

                    <textarea

                      name={q.id}

                      className="assessment-textarea"

                      rows={6}

                    />

                  )

                }







                {
                  q.question_type === "Summary"

                  &&

                  (

                    <div className="summary-box">

                      {q.question_text}

                    </div>

                  )

                }





              </div>

            );


          }

        )}





        <div className="submit-container">


          <button

            type="submit"

            className="submit-button"

          >

            Submit Assessment


          </button>


        </div>



      </form>


    </div>

  );


}