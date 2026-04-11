import { requireAdmin } from '@/utils/checkAdmin'
import NewQuestionForm from './NewQuestionForm'

export default async function NewQuestionPage() {
  await requireAdmin()
  return <NewQuestionForm />
}
