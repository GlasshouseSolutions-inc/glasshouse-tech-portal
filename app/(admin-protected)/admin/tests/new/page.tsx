//admin/tests/new/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function NewTestPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Technical')
  const [loading, setLoading] = useState(false)
  const [timeLimit, setTimeLimit] = useState(60);

  const categories = ['Technical', 'Sales', 'Marketing', 'Operations', 'Leadership', 'Customer Service']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('tests').insert([
      { name, description, category, time_limit: timeLimit }
    ])

    setLoading(false)
    if (error) alert(error.message)
    else router.push('/admin/tests')
  }

  return (
    <div>
      <h1>New Test</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div>
          <label>
            Time Limit (minutes)
          </label>

          <input
            type="number"
            min="5"
            value={timeLimit}
            onChange={(e) =>
              setTimeLimit(Number(e.target.value))
            }
          />
        </div>

        <div>
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div>
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Test'}</button>
      </form>
    </div>
  )
}