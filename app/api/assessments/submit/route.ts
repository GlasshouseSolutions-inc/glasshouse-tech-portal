// app/api/assessments/submit/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";


const SHORT_ANSWER_MATCH_THRESHOLD = 30;


const SHORT_ANSWER_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "with",
  "use"
]);


function getMeaningfulWords(text: string) {

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(word =>
      word.length > 0 &&
      !SHORT_ANSWER_STOP_WORDS.has(word)
    );

}


function gradeShortAnswer(
  submittedAnswer: string,
  expectedAnswer: string
) {

  const expectedWords =
    Array.from(
      new Set(
        getMeaningfulWords(
          expectedAnswer
        )
      )
    );


  const submittedWords =
    new Set(
      getMeaningfulWords(
        submittedAnswer
      )
    );


  if (
    expectedWords.length === 0 ||
    submittedWords.size === 0
  ) {

    return {
      isCorrect: false,
      matchPercentage: 0
    };

  }


  let matchedWords = 0;


  for (const word of expectedWords) {

    if (
      submittedWords.has(word)
    ) {

      matchedWords++;

    }

  }


  const matchPercentage =
    Math.round(
      (
        matchedWords /
        expectedWords.length
      ) * 100
    );


  return {

    isCorrect:
      matchPercentage >=
      SHORT_ANSWER_MATCH_THRESHOLD,

    matchPercentage

  };

}


export async function POST(req: NextRequest) {

  try {

    const formData = await req.formData();

    const attemptId =
      formData.get("attempt_id") as string;


    if (!attemptId) {

      return NextResponse.json(
        {
          error:
            "Missing attempt id"
        },
        {
          status: 400
        }
      );

    }



    /*
      Load assessment attempt
    */

    const {
      data: attempt,
      error: attemptError
    } =
      await supabase
        .from("test_attempts")
        .select(`
          id,
          applicant_id,
          test_id,
          assignment_id
        `)
        .eq(
          "id",
          attemptId
        )
        .single();



    if (
      attemptError ||
      !attempt
    ) {

      console.error(
        "Attempt lookup failed:",
        {
          attemptId,
          attemptError
        }
      );


      return NextResponse.json(
        {
          error:
            "Attempt not found",

          details:
            attemptError?.message ??
            null
        },
        {
          status: 404
        }
      );

    }



    /*
      Load test configuration
    */

    const {
      data: test,
      error: testError
    } =
      await supabase
        .from("tests")
        .select(`
          passing_percentage
        `)
        .eq(
          "id",
          attempt.test_id
        )
        .single();



    if (
      testError ||
      !test
    ) {

      console.error(
        "Test configuration lookup failed:",
        testError
      );


      return NextResponse.json(
        {
          error:
            "Test configuration not found"
        },
        {
          status: 404
        }
      );

    }



    /*
      Load assignment configuration
    */

    const {
      data: assignment,
      error: assignmentError
    } =
      await supabase
        .from("assignments")
        .select(`
          purpose
        `)
        .eq(
          "id",
          attempt.assignment_id
        )
        .single();



    if (
      assignmentError ||
      !assignment
    ) {

      console.error(
        "Assignment configuration lookup failed:",
        assignmentError
      );


      return NextResponse.json(
        {
          error:
            "Assignment configuration not found"
        },
        {
          status: 404
        }
      );

    }



    /*
      Load generated questions
    */

    const {
      data: attemptQuestions,
      error: aqError
    } =
      await supabase
        .from("attempt_questions")
        .select(`
          question_id,
          questions (
            id,
            question_type,
            expected_answer,
            choice_a,
            choice_b,
            choice_c,
            choice_d
          )
        `)
        .eq(
          "attempt_id",
          attemptId
        );



    if (aqError) {

      throw aqError;

    }



    const totalQuestions =
      attemptQuestions?.length ||
      0;


    let correctAnswers = 0;



    const answers: {
      attempt_id: string;
      applicant_id: string;
      test_id: string;
      question_id: string;
      answer_text: string;
    }[] = [];



    /*
      Grade each question
    */

    for (
      const item
      of attemptQuestions || []
    ) {


      const question =
        item.questions as any;


      const submittedAnswer =
        formData.get(
          item.question_id
        );


      const answerText =
        typeof submittedAnswer ===
          "string"
          ?
          submittedAnswer.trim()
          :
          "";



      answers.push({

        attempt_id:
          attemptId,

        applicant_id:
          attempt.applicant_id,

        test_id:
          attempt.test_id,

        question_id:
          item.question_id,

        answer_text:
          answerText

      });



      if (!question) {

        continue;

      }



      let isCorrect = false;



      /*
        Multiple Choice grading
      */

      if (
        question.question_type ===
        "Multiple Choice"
      ) {


        const expectedLetter =
          question.expected_answer
            ?.trim()
            .toUpperCase();



        let correctText = "";



        switch (
        expectedLetter
        ) {

          case "A":

            correctText =
              question.choice_a;

            break;


          case "B":

            correctText =
              question.choice_b;

            break;


          case "C":

            correctText =
              question.choice_c;

            break;


          case "D":

            correctText =
              question.choice_d;

            break;

        }



        if (
          answerText
            .toLowerCase()
          ===
          correctText
            ?.trim()
            .toLowerCase()
        ) {

          isCorrect = true;

        }



        /*
          Short Answer grading
        */

      } else if (
        question.question_type ===
        "Short Answer"
      ) {


        const shortAnswerResult =
          gradeShortAnswer(
            answerText,
            question.expected_answer ??
            ""
          );


        isCorrect =
          shortAnswerResult.isCorrect;

      }



      if (isCorrect) {

        correctAnswers++;

      }

    }



    /*
      Store submitted answers
    */

    if (
      answers.length > 0
    ) {

      const {
        error: answerError
      } =
        await supabase
          .from(
            "applicant_answers"
          )
          .insert(
            answers
          );


      if (answerError) {

        throw answerError;

      }

    }



    /*
      Calculate assessment score
    */

    const score =
      totalQuestions === 0
        ?
        0
        :
        Math.round(
          (
            correctAnswers /
            totalQuestions
          ) *
          100
        );



    /*
      Determine passing threshold

      Use the test-specific value
      when configured.

      Otherwise default to 80%.
    */

    const passingPercentage =
      Number(
        test.passing_percentage ??
        80
      );



    const passFail =
      score >=
        passingPercentage
        ?
        "PASS"
        :
        "FAIL";



    /*
      Purpose-aware recommendation
    */

    const purpose =
      assignment.purpose ??
      "";


    let recommendation = "";


    if (
      purpose ===
      "Applicant Screening"
    ) {

      recommendation =
        score >=
          passingPercentage
          ?
          "Hire"
          :
          score >= 50
            ?
            "Review"
            :
            "Reject";

    } else {

      recommendation =
        score >=
          passingPercentage
          ?
          "Meets Standard"
          :
          "Needs Review";

    }



    /*
      Use one completion timestamp
      for the result, attempt,
      and assignment.
    */

    const completedTime =
      new Date()
        .toISOString();



    /*
      Store test result
    */

    const {
      error: resultError
    } =
      await supabase
        .from("test_results")
        .insert([
          {

            applicant_id:
              attempt.applicant_id,

            test_id:
              attempt.test_id,

            attempt_id:
              attemptId,

            score,

            recommendation,

            pass_fail:
              passFail,

            completed_at:
              completedTime

          }
        ]);



    if (resultError) {

      throw resultError;

    }



    /*
      Complete test attempt
    */

    const {
      error: attemptUpdateError
    } =
      await supabase
        .from("test_attempts")
        .update({

          status:
            "COMPLETED",

          completed_at:
            completedTime

        })
        .eq(
          "id",
          attemptId
        );



    if (
      attemptUpdateError
    ) {

      throw attemptUpdateError;

    }



    /*
      Complete exact assignment
    */

    const {
      error: assignmentUpdateError
    } =
      await supabase
        .from("assignments")
        .update({

          status:
            "Completed",

          completed_at:
            completedTime

        })
        .eq(
          "id",
          attempt.assignment_id
        );



    if (
      assignmentUpdateError
    ) {

      throw assignmentUpdateError;

    }



    /*
      Redirect to completion page
    */

    return NextResponse.redirect(
      new URL(
        "/assessment/complete",
        req.url
      )
    );



  } catch (
  error: any
  ) {


    console.error(
      "Assessment submission failed:",
      error
    );


    return NextResponse.json(
      {
        error:
          error.message ||
          "Submission failed"
      },
      {
        status: 500
      }
    );

  }

}