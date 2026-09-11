// app/page.tsx
import { supabase } from '@/lib/supabase/client'

export default async function Home() {
  const { data, error } = await supabase
    .from('questions')
    .select('*')

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Glasshouse DB Test</h1>

      <pre>{JSON.stringify({ data, error }, null, 2)}</pre>
    </main>
  )
}