'use client'
import { useState } from 'react'
import { Avatar, Field, Toggle, Badge, SegControl } from '@/components/ui'
import { Mail, Lock } from '@/components/ui'
import { useRole } from '@/contexts/RoleContext'
import { useAuth } from '@/contexts/AuthContext'

// ── Profile Tab ────────────────────────────────────────────────────────────────
function ProfileTab({ role }: { role: 'student' | 'teacher' }) {
  const { user } = useAuth()
  const name = user?.name ?? ''
  const email = user?.email ?? ''
  const color = user?.color ?? '#2747E0'
  return (
    <div className="col" style={{ gap: 24 }}>
      <section className="card card-pad-lg">
        <h3 className="h3" style={{ marginBottom: 4 }}>Profile</h3>
        <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>How you appear across Atlas.</p>

        <div className="row" style={{ gap: 20, marginBottom: 24 }}>
          <Avatar name={name} color={color} size="lg" />
          <div>
            <button className="btn btn-secondary btn-sm">Upload photo</button>
            <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>PNG or JPG · max 2MB</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Full name"><input className="input" defaultValue={name} /></Field>
          <Field label="Display name"><input className="input" defaultValue={name.split(' ')[0]} /></Field>
          <Field label="Email"><input className="input" defaultValue={email} /></Field>
          <Field label="Time zone">
            <select className="select">
              <option>Europe/Madrid (GMT+2)</option>
              <option>Europe/London</option>
              <option>America/New_York</option>
            </select>
          </Field>
          <Field label="Preferred language" hint="of the interface">
            <select className="select">
              <option>English</option>
              <option>Español</option>
              <option>Français</option>
            </select>
          </Field>
          <Field label={role === 'teacher' ? 'Title' : 'Goal'} hint="optional">
            <input
              className="input"
              defaultValue={role === 'teacher' ? 'Senior IELTS Coach' : 'Reach C1 in English by Dec'}
            />
          </Field>
        </div>

        <hr className="divider" />

        <Field label="Bio" help="Shown on your public profile.">
          <textarea
            className="textarea"
            rows={3}
            defaultValue={
              role === 'teacher'
                ? 'IELTS examiner & language coach. 8 years of helping students cross the band-7 line.'
                : 'Software engineer prepping for a move to Madrid. Learning Spanish in parallel.'
            }
          />
        </Field>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
          <button className="btn btn-ghost">Discard</button>
          <button className="btn btn-primary">Save changes</button>
        </div>
      </section>
    </div>
  )
}

// ── Account & Security Tab ─────────────────────────────────────────────────────
function AccountTab() {
  const { user } = useAuth()
  return (
    <div className="col" style={{ gap: 24 }}>
      <section className="card card-pad-lg">
        <h3 className="h3" style={{ marginBottom: 4 }}>Sign-in methods</h3>
        <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>Choose how you sign in to Atlas.</p>

        <div className="col" style={{ gap: 12 }}>
          <div className="row" style={{ padding: 14, background: 'var(--paper-2)', borderRadius: 'var(--r-md)', gap: 14 }}>
            <Mail size={20} color="var(--brand)" />
            <div style={{ flex: 1 }}>
              <b style={{ fontSize: 13 }}>Magic link sign-in</b>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>Get a one-time link emailed to {user?.email ?? '…'}.</div>
            </div>
            <Badge tone="success">Enabled</Badge>
          </div>
          <div className="row" style={{ padding: 14, background: 'var(--paper-2)', borderRadius: 'var(--r-md)', gap: 14 }}>
            <Lock size={20} color="var(--brand)" />
            <div style={{ flex: 1 }}>
              <b style={{ fontSize: 13 }}>Password</b>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>Last changed 23 days ago</div>
            </div>
            <button className="btn btn-secondary btn-sm">Change</button>
          </div>
          <div className="row" style={{ padding: 14, background: 'var(--paper-2)', borderRadius: 'var(--r-md)', gap: 14 }}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.6a4.8 4.8 0 0 1-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.6z"/>
              <path fill="#34A853" d="M12 22c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7C4.4 19.7 7.9 22 12 22z"/>
              <path fill="#FBBC05" d="M6.2 13.6a6 6 0 0 1 0-3.8V7.1H2.7a10 10 0 0 0 0 9z"/>
              <path fill="#EA4335" d="M12 5.8c1.5 0 2.9.5 4 1.5l3-3A10 10 0 0 0 2.7 7.1l3.5 2.7c.8-2.5 3.1-4 5.8-4z"/>
            </svg>
            <div style={{ flex: 1 }}>
              <b style={{ fontSize: 13 }}>Google</b>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>Not connected</div>
            </div>
            <button className="btn btn-secondary btn-sm">Connect</button>
          </div>
        </div>
      </section>

      <section className="card card-pad-lg">
        <h3 className="h3" style={{ marginBottom: 4 }}>Two-factor authentication</h3>
        <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>Adds a one-time code to your sign-in.</p>
        <div className="row" style={{ gap: 14, padding: 14, background: 'var(--warning-tint)', borderRadius: 'var(--r-md)' }}>
          <Lock size={20} color="var(--warning)" />
          <div style={{ flex: 1, fontSize: 13, color: 'var(--ink-2)' }}>
            2FA is currently <b>off</b>. We strongly recommend enabling it.
          </div>
          <button className="btn btn-primary btn-sm">Enable 2FA</button>
        </div>
      </section>

      <section className="card card-pad-lg">
        <h3 className="h3" style={{ marginBottom: 4, color: 'var(--danger)' }}>Danger zone</h3>
        <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>These actions can&apos;t be undone.</p>
        <div className="col" style={{ gap: 8 }}>
          <div className="row" style={{ padding: 12, border: '1px solid var(--line-2)', borderRadius: 'var(--r-md)', gap: 12 }}>
            <div style={{ flex: 1, fontSize: 13 }}>
              <b>Export account data</b>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>Download everything in a ZIP.</div>
            </div>
            <button className="btn btn-secondary btn-sm">Request export</button>
          </div>
          <div className="row" style={{ padding: 12, border: '1px solid #F2C9C0', background: 'var(--danger-tint)', borderRadius: 'var(--r-md)', gap: 12 }}>
            <div style={{ flex: 1, fontSize: 13 }}>
              <b style={{ color: 'var(--danger)' }}>Delete account</b>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>Permanently remove your account and all data.</div>
            </div>
            <button className="btn btn-danger btn-sm">Delete</button>
          </div>
        </div>
      </section>
    </div>
  )
}

// ── Notifications Tab ──────────────────────────────────────────────────────────
function NotificationsTab() {
  const rows = [
    { label: 'New lesson available', desc: 'When a new lesson drops in a course you\'re in' },
    { label: 'Quiz / exam graded', desc: 'When your instructor returns a grade' },
    { label: 'Discussion replies', desc: 'Someone replies to your Q&A post' },
    { label: 'Weekly progress digest', desc: 'Summary of your week, every Monday' },
    { label: 'Streak reminders', desc: 'Gentle nudge if you miss a day' },
  ]
  return (
    <section className="card card-pad-lg">
      <h3 className="h3" style={{ marginBottom: 4 }}>Notifications</h3>
      <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>Choose how Atlas reaches you.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--line)' }}>
            <th style={{ textAlign: 'left', padding: '8px 0', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}></th>
            <th style={{ padding: '8px 0', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', width: 80 }}>Email</th>
            <th style={{ padding: '8px 0', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', width: 80 }}>Push</th>
            <th style={{ padding: '8px 0', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', width: 80 }}>In-app</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--line)' }}>
              <td style={{ padding: '14px 0' }}>
                <b style={{ fontSize: 13 }}>{r.label}</b>
                <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{r.desc}</div>
              </td>
              <td style={{ textAlign: 'center' }}><Toggle defaultOn={i !== 4} /></td>
              <td style={{ textAlign: 'center' }}><Toggle defaultOn={i < 2} /></td>
              <td style={{ textAlign: 'center' }}><Toggle defaultOn /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

// ── Billing Tab ────────────────────────────────────────────────────────────────
function BillingTab() {
  return (
    <section className="card card-pad-lg">
      <h3 className="h3" style={{ marginBottom: 4 }}>Billing</h3>
      <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>Your plan and payment methods.</p>
      <div
        className="card card-pad"
        style={{
          background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%)',
          color: '#fff',
          border: 0,
          marginBottom: 16,
        }}
      >
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8, marginBottom: 6 }}>
              Current plan
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, lineHeight: 1 }}>Atlas Pro</div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 8 }}>€19 / month · renews June 19, 2026</div>
          </div>
          <button className="btn btn-secondary" style={{ background: '#fff' }}>Manage plan</button>
        </div>
      </div>
      <div className="row" style={{ padding: 14, border: '1px solid var(--line-2)', borderRadius: 'var(--r-md)', gap: 12 }}>
        <div style={{
          width: 40, height: 28,
          background: 'linear-gradient(135deg, #1A1F71, #3B5BC9)',
          borderRadius: 4, display: 'grid', placeItems: 'center',
          color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
        }}>VISA</div>
        <div style={{ flex: 1, fontSize: 13 }}>
          <b>•••• 4242</b>
          <div className="muted" style={{ fontSize: 12 }}>Expires 09/27</div>
        </div>
        <button className="btn btn-ghost btn-sm">Update</button>
      </div>
    </section>
  )
}

// ── Appearance Tab ─────────────────────────────────────────────────────────────
function AppearanceTab() {
  const [density, setDensity] = useState('comfortable')
  return (
    <section className="card card-pad-lg">
      <h3 className="h3" style={{ marginBottom: 4 }}>Appearance</h3>
      <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>
        Personalize how Atlas looks. Try out theme variations from the Tweaks panel too.
      </p>
      <Field label="Density">
        <SegControl
          value={density}
          onChange={setDensity}
          options={[
            { value: 'compact', label: 'Compact' },
            { value: 'comfortable', label: 'Comfortable' },
            { value: 'spacious', label: 'Spacious' },
          ]}
        />
      </Field>
      <div style={{ height: 16 }} />
      <Field label="Reduce motion">
        <div className="row" style={{ gap: 10 }}>
          <Toggle />
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>Disable animated transitions</span>
        </div>
      </Field>
    </section>
  )
}

// ── Settings Page ──────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { role } = useRole()
  const [tab, setTab] = useState<'profile' | 'account' | 'notifications' | 'billing' | 'appearance'>('profile')

  const tabs: { id: typeof tab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'account', label: 'Account & security' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'billing', label: 'Billing' },
    { id: 'appearance', label: 'Appearance' },
  ]

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">{role === 'teacher' ? 'Instructor' : 'Student'} account</div>
          <h1 className="h1">Settings</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 32 }}>
        {/* Vertical tab sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '10px 14px',
                textAlign: 'left',
                background: tab === t.id ? 'var(--card)' : 'transparent',
                border: 0,
                borderRadius: 'var(--r-md)',
                fontWeight: 500,
                fontSize: 13,
                cursor: 'pointer',
                color: tab === t.id ? 'var(--ink)' : 'var(--muted)',
                boxShadow: tab === t.id ? 'var(--sh-sm)' : 'none',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <div style={{ maxWidth: 680 }}>
          {tab === 'profile' && <ProfileTab role={role} />}
          {tab === 'account' && <AccountTab />}
          {tab === 'notifications' && <NotificationsTab />}
          {tab === 'billing' && <BillingTab />}
          {tab === 'appearance' && <AppearanceTab />}
        </div>
      </div>
    </div>
  )
}
