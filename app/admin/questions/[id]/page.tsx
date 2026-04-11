import { supabase } from '@/utils/supabaseServer'
import EditQuestionForm from './EditQuestionForm'
import { requireAdmin } from '@/utils/checkAdmin'

export default async function EditQuestionPage(props) {
  await requireAdmin()

  // Fix: params must be awaited in Next.js 14+
  const params = await props.params
  const questionId = params.id

  console.log("QUESTION ID:", questionId)

  const { data: question } = await supabase
    .from('questions')
    .select('*')
    .eq('id', questionId)
    .maybeSingle()

  if (!question) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Question Not Found</h1>
        <p className="text-gray-600">This question does not exist or was deleted.</p>
      </div>
    )
  }

  return <EditQuestionForm question={question} />
}
