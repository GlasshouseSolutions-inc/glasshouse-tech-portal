import { supabase } from "@/utils/supabaseServer";

export default async function ApplicantDetailPage({ params }: { params: { id: string } }) {
  const applicantId = params.id;

  // Load user from Supabase Auth
  const { data: userData, error: userError } =
    await supabase.auth.admin.getUserById(applicantId);

  const user = userData?.user;

  // Load test result
  const { data: result } = await supabase
    .from("test_results")
    .select("*")
    .eq("applicant_id", applicantId)
    .maybeSingle();

  // Load all questions
  const { data: questions } = await supabase
    .from("questions")
    .select("*");

  // Load applicant answers
  const { data: answers } = await supabase
    .from("applicant_answers")
    .select("*")
    .eq("applicant_id", applicantId);

  const answerMap = new Map();
  answers?.forEach((a) => answerMap.set(a.question_id, a));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Applicant Details</h1>

      <div className="mb-6 space-y-1">
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Status:</strong> {result ? "Completed" : "In Progress"}</p>
        {result && (
          <>
            <p><strong>Score:</strong> {result.score}/{result.total_questions}</p>
            <p><strong>Completed:</strong> {new Date(result.completed_at).toLocaleString()}</p>
          </>
        )}
      </div>

      <h2 className="text-xl font-semibold mb-4">Answer Breakdown</h2>

      <div className="space-y-4">
        {questions?.map((q) => {
          const ans = answerMap.get(q.id);
          const isCorrect = ans?.answer === q.correct_answer;

          return (
            <div key={q.id} className="border p-4 rounded">
              <p className="font-semibold">{q.question_text}</p>

              <p className="mt-2">
                <strong>Your Answer:</strong>{" "}
                {ans ? ans.answer : <span className="text-gray-500">No answer</span>}
              </p>

              <p>
                <strong>Correct Answer:</strong> {q.correct_answer}
              </p>

              <p className={`mt-1 font-bold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                {ans ? (isCorrect ? "Correct" : "Incorrect") : "Not Answered"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
