// app/admin/layout.tsx
'use client'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Applicants', href: '/admin/applicants' },
    { name: 'Assignments', href: '/admin/assignments' },
    { name: 'Employees', href: '/admin/employees' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Questions', href: '/admin/questions' },
    { name: 'Tests', href: '/admin/tests' },
    { name: 'Results', href: '/admin/results' },
    { name: 'Reports', href: '/admin/reports' },
    { name: 'Settings', href: '/admin/settings' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '250px',
          backgroundColor: '#141B4D',
          color: 'white',
          padding: '1rem',
        }}
      >
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Glasshouse</h2>

        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {navItems.map((item) => (
              <li key={item.name} style={{ marginBottom: '1rem' }}>
                <Link href={item.href} style={{ color: 'white', textDecoration: 'none' }}>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Navigation */}
        <header
          style={{
            height: '60px',
            backgroundColor: '#FE5000',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            padding: '0 2rem',
            fontWeight: 'bold',
            fontSize: '1.25rem',
          }}
        >
          Glasshouse Admin Portal
        </header>

        {/* Page content */}
        <main style={{ flex: 1, backgroundColor: '#F5F6F8', padding: '2rem' }}>
          {children}
        </main>
      </div>
    </div>
  )
}