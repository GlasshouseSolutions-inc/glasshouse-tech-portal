export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6">
        <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>

        <nav className="space-y-4">
          <a href="/admin" className="block text-gray-700 hover:text-black">
            Dashboard
          </a>
          <a href="/admin/questions" className="block text-gray-700 hover:text-black">
            Manage Questions
          </a>
          <a href="/admin/questions/new" className="block text-gray-700 hover:text-black">
            Add Question
          </a>
          <a href="/admin" className="block text-gray-700 hover:text-black">
            View Results
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">{children}</main>
    </div>
  )
}
