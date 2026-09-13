import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Verify the authenticated Supabase user from the server-side session.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F5F6F8',
          fontFamily: 'Arial, Helvetica, sans-serif',
          padding: '2rem',
        }}
      >
        <div
          style={{
            maxWidth: '500px',
            width: '100%',
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <h1 style={{ marginTop: 0 }}>
            Admin Authentication Required
          </h1>

          <p>
            You must sign in with an authorized administrative account
            before accessing the Glasshouse Admin Portal.
          </p>
        </div>
      </div>
    )
  }

  // Ask PostgreSQL whether the authenticated user has the admin role.
  const {
    data: isAdmin,
    error: adminError,
  } = await supabase.rpc('is_admin')

  if (adminError || isAdmin !== true) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F5F6F8',
          fontFamily: 'Arial, Helvetica, sans-serif',
          padding: '2rem',
        }}
      >
        <div
          style={{
            maxWidth: '500px',
            width: '100%',
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <h1 style={{ marginTop: 0 }}>
            Access Denied
          </h1>

          <p>
            Your account is authenticated, but it is not authorized to
            access the Glasshouse Admin Portal.
          </p>
        </div>
      </div>
    )
  }

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
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <aside
        style={{
          width: '250px',
          backgroundColor: '#141B4D',
          color: 'white',
          padding: '1rem',
        }}
      >
        <h2
          style={{
            fontSize: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          Glasshouse
        </h2>

        <nav>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
            }}
          >
            {navItems.map((item) => (
              <li
                key={item.name}
                style={{
                  marginBottom: '1rem',
                }}
              >
                <Link
                  href={item.href}
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                  }}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
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

        <main
          style={{
            flex: 1,
            backgroundColor: '#F5F6F8',
            padding: '2rem',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}