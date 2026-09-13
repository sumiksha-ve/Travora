import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { createTravelRequest, getTravelRequests, login, logout } from './api/api'

const emptyForm = {
  tripType: 'BUSINESS',
  fromLocation: '',
  toLocation: '',
  travelDate: '',
  returnDate: '',
  projectName: '',
  reason: '',
}

const navItems = [
  { id: 'dashboard', icon: '⌂', label: 'Overview' },
  { id: 'plan', icon: '✈', label: 'Plan a trip' },
  { id: 'requests', icon: '▣', label: 'My journeys' },
  { id: 'approvals', icon: '✓', label: 'Approvals', badge: true },
  { id: 'reports', icon: '▥', label: 'Reports' },
  { id: 'support', icon: '◌', label: 'Support' },
]

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

function shortDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short' }).format(new Date(value))
}

function statusClass(status = '') {
  return `status-pill status-${status.toLowerCase()}`
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('travora_user') || '{}')
  } catch {
    return {}
  }
}

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('employee1')
  const [password, setPassword] = useState('employee123')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = await login(username, password)
      localStorage.setItem('travora_token', data.token)
      localStorage.setItem('travora_user', JSON.stringify(data))
      onLogin(data)
    } catch (err) {
      setError(err.message || 'Unable to sign in')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-shell">
      <div className="login-orbit orbit-one" />
      <div className="login-orbit orbit-two" />
      <div className="login-card">
        <div className="brand-mark large">T</div>
        <div className="eyebrow">TRAVEL. REIMAGINED</div>
        <h1>Welcome to <span>travora</span></h1>
        <p>One workspace for every business journey.</p>
        <form onSubmit={submit}>
          <label>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <div className="form-error">{error}</div>}
          <button className="lime-button full" disabled={busy}>
            {busy ? 'Signing in…' : 'Enter workspace →'}
          </button>
        </form>
      </div>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(getUser())
  const [page, setPage] = useState('dashboard')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const isLoggedIn = Boolean(localStorage.getItem('travora_token'))

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false)
      return
    }

    loadRequests()
  }, [isLoggedIn])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(timer)
  }, [toast])

  async function loadRequests() {
    setLoading(true)
    try {
      const data = await getTravelRequests()
      setRequests(Array.isArray(data) ? data : [])
    } catch (err) {
      setToast(err.message || 'Could not load journeys')
    } finally {
      setLoading(false)
    }
  }

  function goTo(nextPage) {
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleLogout() {
    logout()
    setUser({})
    setRequests([])
  }

  async function submitRequest(event) {
    event.preventDefault()
    setSubmitting(true)
    try {
      await createTravelRequest(form)
      setForm(emptyForm)
      await loadRequests()
      setToast('Journey request submitted successfully ✨')
      goTo('requests')
    } catch (err) {
      setToast(err.message || 'Could not submit request')
    } finally {
      setSubmitting(false)
    }
  }

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((r) => r.status === 'PENDING').length,
    approved: requests.filter((r) => r.status === 'APPROVED').length,
    booked: requests.filter((r) => r.status === 'BOOKED').length,
  }), [requests])

  const latest = requests[0]
  const upcoming = [...requests]
    .filter((r) => r.travelDate && new Date(r.travelDate) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.travelDate) - new Date(b.travelDate))[0]

  if (!isLoggedIn) return <LoginScreen onLogin={setUser} />

  const displayName = user.username || user.name || 'Traveler'
  const employeeId = user.employeeId || 'EMP001'

  return (
    <div className="travora-app">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />

      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">T</div>
          <div>
            <div className="brand-name">travora</div>
            <div className="brand-tag">TRAVEL. REIMAGINED</div>
          </div>
        </div>

        <div className="side-label">WORKSPACE</div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={page === item.id ? 'nav-item active' : 'nav-item'}
              onClick={() => goTo(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && stats.pending > 0 && <b>{stats.pending}</b>}
            </button>
          ))}
        </nav>

        <div className="next-adventure">
          <div className="mini-stars">✦</div>
          <span>Ready for your next</span>
          <strong>adventure?</strong>
          <button onClick={() => goTo('plan')}>Plan a trip <span>→</span></button>
        </div>

        <div className="profile-card">
          <div className="avatar">{displayName.charAt(0).toUpperCase()}</div>
          <div className="profile-copy">
            <strong>{displayName}</strong>
            <span>{user.role || 'EMPLOYEE'} • {employeeId}</span>
          </div>
          <button className="dots" onClick={handleLogout} title="Sign out">⋮</button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs">Travora <span>/</span> <strong>Workspace</strong></div>
          <div className="top-actions">
            <button title="Search">⌕</button>
            <button title="Notifications" className="notification">♧<i>{stats.pending || ''}</i></button>
            <button title="Theme">☼</button>
            <div className="user-mini">
              <div className="avatar small">{displayName.charAt(0).toUpperCase()}</div>
              <div><strong>{displayName}</strong><span>{user.role || 'EMPLOYEE'}</span></div>
              <span>⌄</span>
            </div>
          </div>
        </header>

        {page === 'dashboard' && (
          <Dashboard
            displayName={displayName}
            stats={stats}
            latest={latest}
            upcoming={upcoming}
            requests={requests}
            loading={loading}
            onPlan={() => goTo('plan')}
            onRequests={() => goTo('requests')}
            onReports={() => goTo('reports')}
          />
        )}

        {page === 'plan' && (
          <PlanPage
            form={form}
            setForm={setForm}
            submitting={submitting}
            onSubmit={submitRequest}
            onBack={() => goTo('dashboard')}
          />
        )}

        {page === 'requests' && (
          <RequestsPage requests={requests} loading={loading} onRefresh={loadRequests} onPlan={() => goTo('plan')} />
        )}

        {page === 'approvals' && (
          <InfoPage icon="✓" eyebrow="WORKFLOW" title="Approval center" text="Your submitted journeys move here for manager approval. Once approved, the travel desk can continue with booking." action="View my journeys" onAction={() => goTo('requests')} />
        )}

        {page === 'reports' && <ReportsPage requests={requests} stats={stats} />}

        {page === 'support' && (
          <InfoPage icon="◌" eyebrow="TRAVORA SUPPORT" title="Need a hand?" text="For a real deployment, this space can connect employees with the travel desk for booking questions, changes and cancellations." action="Plan a trip" onAction={() => goTo('plan')} />
        )}
      </main>

      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </div>
  )
}

function Dashboard({ displayName, stats, latest, upcoming, requests, loading, onPlan, onRequests, onReports }) {
  return (
    <div className="page-content dashboard-page">

      {/* ================= HERO ================= */}
      <section className="hero hero-enhanced">

        <div className="hero-copy">
          <div className="eyebrow hero-eyebrow">
            WELCOME BACK
          </div>

          <h1>
            Good to see you,
            <br />
            <span>{displayName}</span>
            <em>👋</em>
          </h1>

          <p>
            Your journeys, approvals and travel plans —
            <br />
            all in one intelligent place.
          </p>

          <div className="hero-actions">
            <button className="lime-button hero-button" onClick={onPlan}>
              <span className="button-plus">＋</span>
              Plan a new journey
              <span className="button-arrow">→</span>
            </button>

            <button
              className="hero-secondary"
              onClick={onRequests}
            >
              View journeys
              <span>↗</span>
            </button>
          </div>

          <div className="hero-mini-info">
            <div>
              <span className="mini-dot green"></span>
              <strong>{stats.total}</strong>
              <small> journeys</small>
            </div>

            <div>
              <span className="mini-dot purple"></span>
              <strong>{stats.pending}</strong>
              <small> awaiting approval</small>
            </div>
          </div>
        </div>

        {/* FUTURISTIC FLIGHT VISUAL */}
        <div className="hero-visual enhanced-flight" aria-hidden="true">

          <div className="world-grid"></div>

          <div className="world-glow"></div>

          <div className="map-dot dot-1"></div>
          <div className="map-dot dot-2"></div>
          <div className="map-dot dot-3"></div>
          <div className="map-dot dot-4"></div>
          <div className="map-dot dot-5"></div>
          <div className="map-dot dot-6"></div>

          <div className="flight-route route-one"></div>
          <div className="flight-route route-two"></div>
          <div className="flight-route route-three"></div>

          <div className="route-node node-start">
            <span></span>
          </div>

          <div className="route-node node-end">
            <span></span>
          </div>

          <div className="plane plane-enhanced">
            ✈
          </div>

          <div className="flight-label label-from">
            <span>FROM</span>
            <strong>{latest?.fromLocation || 'CHENNAI'}</strong>
          </div>

          <div className="flight-label label-to">
            <span>TO</span>
            <strong>{latest?.toLocation || 'BANGALORE'}</strong>
          </div>

          <div className="floating-star star-1">✦</div>
          <div className="floating-star star-2">✦</div>
          <div className="floating-star star-3">✦</div>
          <div className="floating-star star-4">✦</div>

          <div className="flight-orbit orbit-a"></div>
          <div className="flight-orbit orbit-b"></div>

        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="stats-grid">

        <StatCard
          icon="▣"
          label="Total journeys"
          value={stats.total}
          caption="All time"
          tone="lime"
        />

        <StatCard
          icon="◷"
          label="Waiting for approval"
          value={stats.pending}
          caption="Awaiting action"
          tone="orange"
        />

        <StatCard
          icon="✓"
          label="Approved"
          value={stats.approved}
          caption="Approved journeys"
          tone="green"
        />

        <StatCard
          icon="✈"
          label="Booked"
          value={stats.booked}
          caption="Confirmed bookings"
          tone="blue"
        />

      </section>

      {/* ================= JOURNEY + ACTIONS ================= */}
      <section className="content-grid">

        <div className="journey-card glass-card">

          <div className="section-heading">

            <div>
              <span className="eyebrow">
                YOUR JOURNEY STATUS
              </span>

              <h2>
                {latest
                  ? `${latest.fromLocation} → ${latest.toLocation}`
                  : 'No journey yet'}
              </h2>
            </div>

            {latest && (
              <span className={statusClass(latest.status)}>
                {latest.status}
              </span>
            )}

          </div>

          {latest ? (
            <>
              <div className="journey-meta">
                ◷ {formatDate(latest.travelDate)}
                &nbsp; • &nbsp;
                ◫ {latest.projectName}
              </div>

              <JourneyTimeline status={latest.status} />

              <button
                className="ghost-button"
                onClick={onRequests}
              >
                View all journeys →
              </button>
            </>
          ) : (

            <div className="empty-inline">

              <span>✈</span>

              <div>
                <strong>
                  Your next adventure starts here.
                </strong>

                <p>
                  Create a travel request and watch it
                  move through approval and booking.
                </p>
              </div>

            </div>

          )}

        </div>

        {/* ================= QUICK ACTIONS ================= */}
        <div className="quick-card glass-card">

          <span className="eyebrow">
            QUICK ACTIONS
          </span>

          <QuickAction
            icon="✈"
            title="Plan a new trip"
            subtitle="Create a new travel request"
            onClick={onPlan}
          />

          <QuickAction
            icon="▣"
            title="View all journeys"
            subtitle="Track your travel requests"
            onClick={onRequests}
          />

          <QuickAction
            icon="✓"
            title="Check status"
            subtitle="See where your request stands"
            onClick={onRequests}
          />

          <QuickAction
            icon="▥"
            title="View reports"
            subtitle="Insights & travel analytics"
            onClick={onReports}
          />

        </div>

      </section>

      {/* ================= BOTTOM ================= */}
      <section className="bottom-grid">

        <div className="recent-card glass-card">

          <div className="section-heading compact">

            <span className="eyebrow">
              RECENT JOURNEYS
            </span>

            <button onClick={onRequests}>
              View all →
            </button>

          </div>

          {loading ? (
            <div className="skeleton-list">
              <div />
              <div />
              <div />
            </div>
          ) : (
            requests
              .slice(0, 3)
              .map((request) => (
                <RecentRow
                  key={request.id}
                  request={request}
                />
              ))
          )}

          {!loading && requests.length === 0 && (
            <div className="empty-small">
              No journeys submitted yet.
            </div>
          )}

        </div>

        {/* ================= UPCOMING TRIP ================= */}
        <div className="upcoming-card glass-card">

          <div className="upcoming-art">

            <div className="city-lights"></div>

            <div className="moon">
              ◐
            </div>

            <div className="upcoming-plane">
              ✈
            </div>

            <div className="upcoming-stars">
              ✦ ✦ ✦
            </div>

          </div>

          <div className="upcoming-copy">

            <span className="eyebrow">
              UPCOMING TRIP
            </span>

            <h3>
              {upcoming
                ? `${upcoming.fromLocation} → ${upcoming.toLocation}`
                : 'Your next adventure'}
            </h3>

            <p>
              {upcoming
                ? `${formatDate(upcoming.travelDate)} • ${upcoming.projectName}`
                : 'Plan ahead and we’ll keep your travel story in one place.'}
            </p>

            <button
              className="outline-lime"
              onClick={upcoming ? onRequests : onPlan}
            >
              {upcoming ? 'View journey' : 'Plan a trip'} →
            </button>

          </div>

        </div>

      </section>

    </div>
  )
}

function StatCard({ icon, label, value, caption, tone }) {
  return <div className="stat-card glass-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-copy"><span>{label}</span><strong>{value}</strong><small>{caption}</small></div><div className={`mini-chart ${tone}`}><i /><i /><i /><i /><i /></div><b className="card-menu">⋮</b></div>
}

function JourneyTimeline({ status }) {

  const steps = [
    {
      icon: '✓',
      title: 'Requested',
      pending: 'Submitted'
    },
    {
      icon: '◷',
      title: 'Approval',
      pending: status === 'PENDING' ? 'Waiting' : 'Approved'
    },
    {
      icon: '▣',
      title: 'Booking',
      pending: status === 'BOOKED' ? 'Confirmed' : 'Upcoming'
    },
    {
      icon: '✦',
      title: 'Journey',
      pending: status === 'BOOKED' ? 'Ready to travel' : 'Upcoming'
    }
  ]

  let currentStep = 0

  if (status === 'APPROVED') {
    currentStep = 1
  }

  if (status === 'BOOKED') {
    currentStep = 3
  }

  if (status === 'REJECTED') {
    currentStep = 1
  }

  const progress =
    currentStep === 0
      ? 0
      : (currentStep / 3) * 100

  return (
    <div className="timeline-enhanced">

      <div className="timeline-track">

        <div className="timeline-track-bg"></div>

        <div
          className="timeline-track-progress"
          style={{ width: `${progress}%` }}
        ></div>

      </div>

      {steps.map((step, index) => {

        const completed = index <= currentStep

        return (
          <div
            className={`timeline-step-enhanced ${
              completed ? 'completed' : ''
            } ${
              index === currentStep ? 'current' : ''
            }`}
            key={step.title}
          >

            <div className="timeline-node">

              <span>
                {step.icon}
              </span>

              {index === currentStep && (
                <i className="node-pulse"></i>
              )}

            </div>

            <div className="timeline-text">

              <strong>
                {step.title}
              </strong>

              <span>
                {step.pending}
              </span>

            </div>

          </div>
        )
      })}

    </div>
  )
}

function QuickAction({ icon, title, subtitle, onClick }) {
  return <button className="quick-action" onClick={onClick}><span className="quick-icon">{icon}</span><span><strong>{title}</strong><small>{subtitle}</small></span><b>›</b></button>
}

function RecentRow({ request }) {
  return <div className="recent-row"><div className="route-dot">✈</div><div className="recent-main"><strong>{request.fromLocation} → {request.toLocation}</strong><span>{shortDate(request.travelDate)} • {request.projectName}</span></div><span className="trip-tag">BUSINESS</span><span className={statusClass(request.status)}>{request.status}</span><span className="row-arrow">›</span></div>
}

function PlanPage({ form, setForm, submitting, onSubmit, onBack }) {
  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }
  return <div className="page-content inner-page"><button className="back-link" onClick={onBack}>← Back to workspace</button><div className="page-title"><div><span className="eyebrow">NEW JOURNEY</span><h1>Plan your next trip<span>.</span></h1><p>Tell us where you’re going. We’ll take care of the workflow from there.</p></div><div className="title-orb">✈</div></div><form className="trip-form glass-card" onSubmit={onSubmit}><div className="form-section-title">Journey details <span>01</span></div><div className="form-grid"><Field label="Trip type"><select name="tripType" value={form.tripType} onChange={change}><option value="BUSINESS">Business</option><option value="ONE_WAY">One way</option><option value="ROUND_TRIP">Round trip</option></select></Field><Field label="Project name"><input name="projectName" value={form.projectName} onChange={change} placeholder="e.g. Client Meeting" required /></Field><Field label="From"><input name="fromLocation" value={form.fromLocation} onChange={change} placeholder="Chennai" required /></Field><Field label="To"><input name="toLocation" value={form.toLocation} onChange={change} placeholder="Bangalore" required /></Field><Field label="Travel date"><input type="date" name="travelDate" value={form.travelDate} onChange={change} required /></Field><Field label="Return date"><input type="date" name="returnDate" value={form.returnDate} onChange={change} /></Field><Field label="Reason for travel" wide><textarea name="reason" value={form.reason} onChange={change} placeholder="What is the purpose of this journey?" rows="4" /></Field></div><div className="form-footer"><div><strong>Ready to send?</strong><span>Your request will be linked to your employee profile automatically.</span></div><button className="lime-button" disabled={submitting}>{submitting ? 'Sending…' : 'Submit journey request →'}</button></div></form></div>
}

function Field({ label, wide, children }) { return <label className={wide ? 'field wide' : 'field'}><span>{label}</span>{children}</label> }

function RequestsPage({ requests, loading, onRefresh, onPlan }) { return <div className="page-content inner-page"><div className="page-title"><div><span className="eyebrow">MY JOURNEYS</span><h1>Every trip, <span>in one view.</span></h1><p>Track requests from the moment you submit them to the moment you travel.</p></div><button className="lime-button" onClick={onPlan}>＋ Plan a trip</button></div><div className="journeys-toolbar glass-card"><span>{requests.length} journey{requests.length === 1 ? '' : 's'}</span><button onClick={onRefresh}>↻ Refresh</button></div><div className="journeys-list">{loading ? <div className="loading-panel">Loading your journeys…</div> : requests.length ? requests.map((r) => <div className="journey-list-row glass-card" key={r.id}><div className="big-route"><span>{r.fromLocation}</span><b>→</b><span>{r.toLocation}</span></div><div><small>PROJECT</small><strong>{r.projectName}</strong></div><div><small>TRAVEL DATE</small><strong>{formatDate(r.travelDate)}</strong></div><span className={statusClass(r.status)}>{r.status}</span><span>›</span></div>) : <div className="empty-panel glass-card"><div>✈</div><h3>No journeys yet</h3><p>Your travel requests will appear here.</p><button className="lime-button" onClick={onPlan}>Create your first journey →</button></div>}</div></div> }

function ReportsPage({ requests, stats }) { const total = Math.max(stats.total, 1); return <div className="page-content inner-page"><span className="eyebrow">TRAVEL ANALYTICS</span><div className="page-title"><div><h1>Your travel <span>story.</span></h1><p>A simple view of how your journeys are moving through Travora.</p></div></div><div className="report-grid"><div className="report-big glass-card"><span className="eyebrow">REQUEST PIPELINE</span><div className="ring"><strong>{Math.round((stats.approved + stats.booked) / total * 100)}%</strong><span>approved / booked</span></div></div><div className="report-metrics glass-card"><Metric label="Total journeys" value={stats.total} /><Metric label="Pending" value={stats.pending} /><Metric label="Approved" value={stats.approved} /><Metric label="Booked" value={stats.booked} /></div><div className="report-list glass-card"><span className="eyebrow">LATEST ACTIVITY</span>{requests.slice(0, 5).map((r) => <RecentRow key={r.id} request={r} />)}{requests.length === 0 && <div className="empty-small">No activity yet.</div>}</div></div></div> }
function Metric({ label, value }) { return <div><span>{label}</span><strong>{value}</strong></div> }

function InfoPage({ icon, eyebrow, title, text, action, onAction }) { return <div className="page-content centered-page"><div className="info-orb">{icon}</div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p><button className="lime-button" onClick={onAction}>{action} →</button></div> }

export default App
