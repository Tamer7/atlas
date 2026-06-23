import { RoleProvider } from '@/contexts/RoleContext'
import { Sidebar } from '@/components/layout/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <div style={{ display: 'grid', gridTemplateColumns: '248px 1fr', height: '100vh' }}>
        <Sidebar />
        <main style={{ overflow: 'auto', background: 'var(--paper)' }}>
          <div style={{ padding: '32px 48px 64px', maxWidth: 1360, margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </RoleProvider>
  )
}
