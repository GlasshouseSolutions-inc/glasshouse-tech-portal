//admin/tests/[id]/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function EditTestPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const [test, setTest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const categories = ['Technical', 'Sales', 'Marketing', 'Operations', 'Leadership', 'Customer Service']

  useEffect(() => {
    const fetchTest = async () => {
      const { data, error } = await supabase.from('tests').select('*').eq('id', id).single()
      if (error) {
        alert(error.message)
        router.push('/admin/tests')
      } else setTest(data)
      setLoading(false)
    }
    fetchTest()
  }, [id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('tests').update({
      name: test.name,
      description: test.description,
      category: test.category
    }).eq('id', id)
    setSaving(false)
    if (error) alert(error.message)
    else router.push('/admin/tests')
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this test?')) return
    const { error } = await supabase.from('tests').delete().eq('id', id)
    if (!error) router.push('/admin/tests')
    else alert(error.message)
  }

  if (loading) return <p>Loading...</p>
  if (!test) return <p>Test not found.</p>

  return (
    <div>
      <h1>Edit Test</h1>
      <form onSubmit={handleSave}>
        <div>
          <label>Name</label>
          <input value={test.name} onChange={e => setTest({ ...test, name: e.target.value })} required />
        </div>

        <div>
          <label>Description</label>
          <textarea value={test.description} onChange={e => setTest({ ...test, description: e.target.value })} />
        </div>

        <div>
          <label>Category</label>
          <select value={test.category} onChange={e => setTest({ ...test, category: e.target.value })}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        <button type="button" onClick={handleDelete} style={{ marginLeft: '1rem', color: 'red' }}>Delete Test</button>
      </form>
    </div>
  )
}