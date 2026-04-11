import { supabase } from "@/utils/supabaseServer";
import Link from "next/link";

export default async function ApplicantListPage() {
  // Load all applicants who have test results
  const { data: results, error } = await supabase
    .from("test_results")
    .select("applicant_id, score, total_questions, completed_at")
    .order("completed_at", { ascending: false });

  if (error) {
    console.error("Error loading applicants:", error);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Applicants</h1>

      {!results || results.length === 0 ? (
        <p>No applicants found.</p>
      ) : (
        <div className="space-y-4">
          {results.map((r) => (
            <div key={r.applicant_id} className="border p-4 rounded">
              <p><strong>ID:</strong> {r.applicant_id}</p>
              <p><strong>Score:</strong> {r.score}/{r.total_questions}</p>
              <p><strong>Completed:</strong> {new Date(r.completed_at).toLocaleString()}</p>

              <Link
                href={`/admin/applicant/${r.applicant_id}`}
                className="text-blue-600 underline"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
