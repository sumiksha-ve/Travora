import { Toaster } from "@/components/ui/sonner";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Compass,
  FileCheck2,
  FileText,
  Filter,
  Headphones,
  LayoutDashboard,
  LogOut,
  Menu,
  Plane,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TicketCheck,
  UserRound,
  UsersRound,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { ThemeProvider } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";

type Role = "EMPLOYEE" | "APPROVER" | "TRAVEL_DESK" | "ADMIN";

type Journey = {
  id: string;
  destination: string;
  from: string;
  to: string;
  dates: string;
  tripType: string;
  project: string;
  status: "Pending approval" | "Approved" | "Booked" | "Completed" | "Cancelled";
  booking?: string;
  passenger?: string;
};

const previewJourneys: Journey[] = [
  { id: "TRV-1048", destination: "Singapore", from: "Bengaluru", to: "Singapore", dates: "24–28 Sep 2026", tripType: "Business", project: "APAC launch", status: "Approved", booking: "Awaiting ticket" },
  { id: "TRV-1039", destination: "London", from: "Mumbai", to: "London", dates: "10–14 Aug 2026", tripType: "Business", project: "Client advisory", status: "Booked", booking: "AI 131 · Confirmed" },
  { id: "TRV-1027", destination: "Dubai", from: "Delhi", to: "Dubai", dates: "02–05 Jul 2026", tripType: "Business", project: "Partner summit", status: "Completed", booking: "EK 511 · Completed" },
  { id: "TRV-1016", destination: "Frankfurt", from: "Bengaluru", to: "Frankfurt", dates: "16–20 Jun 2026", tripType: "Business", project: "Platform migration", status: "Pending approval" },
];

const approverRequests = [
  { id: "TRV-1051", employee: "R. Sharma", team: "Enterprise Sales", route: "Bengaluru → Singapore", dates: "29 Sep – 02 Oct", project: "APAC launch", amount: "₹ 78,400" },
  { id: "TRV-1050", employee: "N. Mehta", team: "Product", route: "Delhi → Amsterdam", dates: "04 – 09 Oct", project: "Design partner week", amount: "₹ 96,200" },
  { id: "TRV-1049", employee: "S. Iyer", team: "Engineering", route: "Hyderabad → London", dates: "11 – 16 Oct", project: "Platform migration", amount: "₹ 1,12,800" },
];

const pageMeta: Record<string, { eyebrow: string; title: string; description?: string }> = {
  "/employee": { eyebrow: "Employee workspace", title: "Overview", description: "Your travel activity, requests and next steps in one place." },
  "/employee/plan-trip": { eyebrow: "Employee workspace", title: "Plan a trip", description: "Create a travel request with the details your approver needs." },
  "/employee/journeys": { eyebrow: "Employee workspace", title: "My journeys", description: "Follow every request from plan to return." },
  "/employee/approvals": { eyebrow: "Employee workspace", title: "Approvals", description: "See what needs your attention and what is moving forward." },
  "/employee/reports": { eyebrow: "Employee workspace", title: "Reports", description: "A clear view of your travel activity and patterns." },
  "/employee/support": { eyebrow: "Employee workspace", title: "Support", description: "Answers and help for every stage of your trip." },
  "/approver": { eyebrow: "Approver workspace", title: "Approval queue", description: "Review requests with enough context to make a confident decision." },
  "/approver/history": { eyebrow: "Approver workspace", title: "Approval history", description: "A record of decisions made across your team." },
  "/travel-desk": { eyebrow: "Travel desk", title: "Operations overview", description: "Keep approved trips moving toward a confirmed booking." },
  "/travel-desk/bookings": { eyebrow: "Travel desk", title: "Booking queue", description: "Manage ticketing details and booking status." },
  "/travel-desk/cancellations": { eyebrow: "Travel desk", title: "Cancellations", description: "Coordinate eligible cancellations and keep the record clear." },
  "/admin": { eyebrow: "Administration", title: "Control center", description: "A high-level view of travel activity across the organization." },
  "/admin/employees": { eyebrow: "Administration", title: "Employees", description: "Directory and travel access for your organization." },
  "/admin/requests": { eyebrow: "Administration", title: "Travel requests", description: "All request activity, across every stage of the lifecycle." },
  "/admin/bookings": { eyebrow: "Administration", title: "Bookings", description: "Visibility into ticketing activity and travel spend." },
  "/admin/reports": { eyebrow: "Administration", title: "Organization reports", description: "Travel patterns to support better planning and policy." },
};

const navByRole: Record<Role, { label: string; href: string; icon: ReactNode }[]> = {
  EMPLOYEE: [
    { label: "Overview", href: "/employee", icon: <LayoutDashboard size={17} /> },
    { label: "Plan a trip", href: "/employee/plan-trip", icon: <Plus size={17} /> },
    { label: "My journeys", href: "/employee/journeys", icon: <Compass size={17} /> },
    { label: "Approvals", href: "/employee/approvals", icon: <FileCheck2 size={17} /> },
    { label: "Reports", href: "/employee/reports", icon: <BarChart3 size={17} /> },
    { label: "Support", href: "/employee/support", icon: <CircleHelp size={17} /> },
  ],
  APPROVER: [
    { label: "Approval queue", href: "/approver", icon: <LayoutDashboard size={17} /> },
    { label: "Approval history", href: "/approver/history", icon: <FileCheck2 size={17} /> },
    { label: "Reports", href: "/employee/reports", icon: <BarChart3 size={17} /> },
    { label: "Support", href: "/employee/support", icon: <CircleHelp size={17} /> },
  ],
  TRAVEL_DESK: [
    { label: "Operations overview", href: "/travel-desk", icon: <LayoutDashboard size={17} /> },
    { label: "Booking queue", href: "/travel-desk/bookings", icon: <TicketCheck size={17} /> },
    { label: "Cancellations", href: "/travel-desk/cancellations", icon: <XCircle size={17} /> },
    { label: "Reports", href: "/employee/reports", icon: <BarChart3 size={17} /> },
  ],
  ADMIN: [
    { label: "Control center", href: "/admin", icon: <LayoutDashboard size={17} /> },
    { label: "Employees", href: "/admin/employees", icon: <UsersRound size={17} /> },
    { label: "Travel requests", href: "/admin/requests", icon: <FileText size={17} /> },
    { label: "Bookings", href: "/admin/bookings", icon: <TicketCheck size={17} /> },
    { label: "Reports", href: "/admin/reports", icon: <BarChart3 size={17} /> },
    { label: "Settings", href: "/admin/settings", icon: <Settings2 size={17} /> },
  ],
};

const roleLabels: Record<Role, string> = {
  EMPLOYEE: "Employee",
  APPROVER: "Approver",
  TRAVEL_DESK: "Travel desk",
  ADMIN: "Administrator",
};

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-lockup ${compact ? "brand-lockup-compact" : ""}`} aria-label="Travora">
      <span className="brand-mark"><Plane size={16} strokeWidth={2.4} /></span>
      <span className="brand-name">travora</span>
    </div>
  );
}

function StatusBadge({ status }: { status: Journey["status"] | "Booking pending" | "Rejected" }) {
  const tone = status.toLowerCase().replaceAll(" ", "-");
  return <span className={`status-badge status-${tone}`}><span className="status-dot" />{status}</span>;
}

function PageTitle({ meta }: { meta: { eyebrow: string; title: string; description?: string } }) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{meta.eyebrow}</p>
        <h1>{meta.title}</h1>
        {meta.description && <p className="page-description">{meta.description}</p>}
      </div>
      <div className="heading-actions"><span className="preview-chip"><Sparkles size={13} /> Preview mode</span></div>
    </div>
  );
}

function Sidebar({ role, path, onRoleChange, onClose }: { role: Role; path: string; onRoleChange: (role: Role) => void; onClose?: () => void }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <Logo />
        <button className="icon-button mobile-only" aria-label="Close navigation" onClick={onClose}><X size={18} /></button>
      </div>
      <div className="workspace-switcher">
        <div className="workspace-avatar">TW</div>
        <div className="workspace-copy"><span>Travora workspace</span><strong>{roleLabels[role]}</strong></div>
        <ChevronDown size={15} className="muted-icon" />
      </div>
      <div className="nav-label">Workspace</div>
      <nav className="primary-nav" aria-label="Primary navigation">
        {navByRole[role].map((item) => {
          const active = path === item.href || (path === "/" && item.href === "/employee");
          return <Link href={item.href} key={item.href} onClick={onClose} className={`nav-item ${active ? "active" : ""}`}>{item.icon}<span>{item.label}</span>{active && <ChevronRight size={14} className="nav-chevron" />}</Link>;
        })}
      </nav>
      <div className="sidebar-spacer" />
      <div className="nav-label">Preview workspace</div>
      <div className="role-select-wrap">
        <SlidersHorizontal size={15} />
        <select aria-label="Preview role" value={role} onChange={(event) => onRoleChange(event.target.value as Role)}>
          <option value="EMPLOYEE">View as Employee</option>
          <option value="APPROVER">View as Approver</option>
          <option value="TRAVEL_DESK">View as Travel desk</option>
          <option value="ADMIN">View as Admin</option>
        </select>
      </div>
      <div className="sidebar-profile">
        <div className="avatar avatar-small">TW</div>
        <div className="profile-copy"><strong>Travora workspace</strong><span>Preview account</span></div>
        <button className="icon-button" aria-label="Open profile menu" onClick={() => toast("Profile settings will connect to the authenticated user context.")}><ChevronDown size={15} /></button>
      </div>
      <Link href="/login" className="logout-link" onClick={onClose}><LogOut size={16} /> Sign out</Link>
    </aside>
  );
}

function Topbar({ onMenu, meta }: { onMenu: () => void; meta: { title: string } }) {
  return (
    <header className="topbar">
      <div className="topbar-left"><button className="icon-button mobile-only" aria-label="Open navigation" onClick={onMenu}><Menu size={20} /></button><div className="breadcrumb"><span>Travora</span><ChevronRight size={14} /><strong>{meta.title}</strong></div></div>
      <div className="topbar-actions"><button className="icon-button notification-button" aria-label="Notifications" onClick={() => toast("You are all caught up.")}><Bell size={18} /><span className="notification-dot" /></button><div className="topbar-divider" /><div className="topbar-user"><div className="avatar avatar-small">TW</div><div className="topbar-user-copy"><strong>Preview workspace</strong><span>Authenticated user</span></div><ChevronDown size={15} className="muted-icon" /></div></div>
    </header>
  );
}

function AppShell({ children, role, setRole }: { children: ReactNode; role: Role; setRole: (role: Role) => void }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const path = location === "/" ? "/employee" : location;
  const meta = pageMeta[path] ?? pageMeta["/employee"];
  useEffect(() => setMobileOpen(false), [location]);
  return (
    <div className="app-shell">
      <div className={`sidebar-overlay ${mobileOpen ? "visible" : ""}`} onClick={() => setMobileOpen(false)} />
      <div className={`sidebar-drawer ${mobileOpen ? "open" : ""}`}><Sidebar role={role} path={path} onRoleChange={setRole} onClose={() => setMobileOpen(false)} /></div>
      <div className="desktop-sidebar"><Sidebar role={role} path={path} onRoleChange={setRole} /></div>
      <div className="app-main"><Topbar onMenu={() => setMobileOpen(true)} meta={meta} /><main className="content-wrap">{children}</main></div>
    </div>
  );
}

function StatCard({ label, value, detail, icon, accent }: { label: string; value: string; detail: string; icon: ReactNode; accent?: string }) {
  return <div className={`stat-card ${accent ?? ""}`}><div className="stat-card-top"><span className="stat-icon">{icon}</span><span className="stat-detail">{detail}</span></div><strong className="stat-value">{value}</strong><span className="stat-label">{label}</span></div>;
}

function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon">{icon}</div><h3>{title}</h3><p>{description}</p>{action}</div>;
}

function Dashboard() {
  return <div className="page-stack animate-page">
    <PageTitle meta={pageMeta["/employee"]} />
    <section className="welcome-grid">
      <div className="welcome-card">
        <div className="welcome-copy"><span className="card-kicker">THURSDAY · 13 AUGUST 2026</span><h2>Make every work trip count.</h2><p>Plan, track and manage your business travel without losing sight of the details.</p><div className="welcome-actions"><Link href="/employee/plan-trip" className="button button-primary"><Plus size={17} /> Plan a trip</Link><Link href="/employee/journeys" className="button button-ghost">View journeys <ArrowUpRight size={16} /></Link></div></div>
        <div className="welcome-orbit"><div className="orbit-ring orbit-ring-one" /><div className="orbit-ring orbit-ring-two" /><div className="orbit-core"><Plane size={27} /></div><span className="orbit-label orbit-label-one">Plan</span><span className="orbit-label orbit-label-two">Approve</span><span className="orbit-label orbit-label-three">Go</span></div>
      </div>
      <div className="upcoming-card"><div className="section-title-row"><div><span className="card-kicker">NEXT JOURNEY</span><h3>Singapore</h3></div><span className="round-arrow"><ArrowUpRight size={17} /></span></div><div className="route-line"><span>Bengaluru</span><span className="route-track"><span className="route-dot" /><span className="route-dash" /><Plane size={14} /></span><span>Singapore</span></div><div className="upcoming-meta"><div><CalendarDays size={15} /><span>24–28 Sep 2026</span></div><div><BriefcaseBusiness size={15} /><span>APAC launch</span></div></div><div className="upcoming-status"><StatusBadge status="Approved" /><span>Travel desk is preparing your booking</span></div></div>
    </section>
    <div className="section-title-row section-title-spaced"><div><span className="card-kicker">AT A GLANCE</span><h2 className="section-heading">Your travel pulse</h2></div><span className="data-note"><Sparkles size={13} /> Preview data</span></div>
    <section className="stats-grid"><StatCard label="Total trips" value="04" detail="This year" icon={<Compass size={18} />} /><StatCard label="Upcoming trips" value="01" detail="Next 30 days" icon={<CalendarDays size={18} />} accent="stat-accent" /><StatCard label="Pending requests" value="01" detail="Needs attention" icon={<Clock3 size={18} />} /><StatCard label="Completed trips" value="01" detail="This year" icon={<Check size={18} />} /></section>
    <section className="dashboard-lower-grid"><div className="panel recent-panel"><div className="section-title-row"><div><span className="card-kicker">RECENT ACTIVITY</span><h2 className="section-heading">My journeys</h2></div><Link href="/employee/journeys" className="text-link">View all <ArrowUpRight size={14} /></Link></div><div className="journey-list">{previewJourneys.slice(0, 3).map((journey) => <JourneyRow key={journey.id} journey={journey} />)}</div></div><div className="panel status-panel"><div className="section-title-row"><div><span className="card-kicker">REQUEST FLOW</span><h2 className="section-heading">Where things stand</h2></div><Compass size={18} className="panel-icon" /></div><div className="flow-list"><FlowItem label="Pending approval" count="01" tone="pending" /><FlowItem label="Approved" count="01" tone="approved" /><FlowItem label="Booked" count="01" tone="booked" /><FlowItem label="Completed" count="01" tone="completed" /></div><Link href="/employee/reports" className="panel-footer-link">See travel reports <ArrowRightIcon /></Link></div></section>
  </div>;
}

function ArrowRightIcon() { return <ChevronRight size={15} />; }

function FlowItem({ label, count, tone }: { label: string; count: string; tone: string }) { return <div className="flow-item"><span className={`flow-marker marker-${tone}`} /><span>{label}</span><strong>{count}</strong></div>; }

function JourneyRow({ journey }: { journey: Journey }) {
  return <Link href={`/employee/journeys?journey=${journey.id}`} className="journey-row"><div className="journey-icon"><Plane size={16} /></div><div className="journey-main"><strong>{journey.destination}</strong><span>{journey.from} → {journey.to} · {journey.dates}</span></div><div className="journey-project">{journey.project}</div><StatusBadge status={journey.status} /><ChevronRight size={16} className="row-chevron" /></Link>;
}

function PlanTrip() {
  const [submitted, setSubmitted] = useState(false);
  return <div className="page-stack animate-page"><PageTitle meta={pageMeta["/employee/plan-trip"]} />
    {submitted ? <div className="success-card"><div className="success-mark"><Check size={22} /></div><div><span className="card-kicker">REQUEST READY</span><h2>Your request is ready to connect.</h2><p>The frontend form is complete. Connect the submit handler to your Spring Boot travel-request endpoint to send it for approval.</p><div className="welcome-actions"><button className="button button-primary" onClick={() => setSubmitted(false)}>Create another request</button><Link href="/employee/journeys" className="button button-ghost">View journeys <ArrowUpRight size={16} /></Link></div></div></div> : <form className="form-layout" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); toast.success("Preview request created locally. No API call was sent."); }}><div className="panel form-panel"><div className="form-intro"><span className="card-kicker">TRAVEL REQUEST</span><h2>Tell us about the trip</h2><p>These details help your approver and travel desk move quickly.</p></div><div className="form-section"><div className="form-section-heading"><span>01</span><div><h3>Trip details</h3><p>Start with the basics of your journey.</p></div></div><div className="form-grid"><label className="field"><span>Trip type</span><select defaultValue="BUSINESS"><option value="BUSINESS">Business</option><option value="CONFERENCE">Conference</option><option value="TRAINING">Training</option></select></label><label className="field"><span>From location</span><div className="input-with-icon"><Compass size={16} /><input required placeholder="City or airport" /></div></label><label className="field"><span>To location</span><div className="input-with-icon"><Plane size={16} /><input required placeholder="City or airport" /></div></label><label className="field"><span>Travel date</span><div className="input-with-icon"><CalendarDays size={16} /><input required type="date" /></div></label><label className="field"><span>Return date</span><div className="input-with-icon"><CalendarDays size={16} /><input required type="date" /></div></label><label className="field"><span>Project name</span><input required placeholder="e.g. APAC launch" /></label></div></div><div className="form-section"><div className="form-section-heading"><span>02</span><div><h3>Business context</h3><p>Give your approver the context they need.</p></div></div><label className="field"><span>Reason for travel</span><textarea required placeholder="What is the purpose of this trip?" rows={4} /></label></div></div><aside className="form-aside"><div className="aside-card aside-dark"><Sparkles size={18} /><h3>Built for the way work moves.</h3><p>Travora keeps the request, approval and booking context together so no detail gets lost in the handoff.</p><div className="aside-line" /><span>Authenticated employee context will be attached automatically.</span></div><div className="aside-card"><div className="section-title-row"><span className="card-kicker">BEFORE YOU SUBMIT</span><Check size={16} className="check-icon" /></div><ul className="check-list"><li><Check size={14} /> Dates are accurate</li><li><Check size={14} /> Project is correctly named</li><li><Check size={14} /> Reason is clear to your approver</li></ul></div><div className="form-actions"><button type="submit" className="button button-primary button-wide">Submit request <ArrowUpRight size={16} /></button><button type="button" className="button button-ghost button-wide" onClick={() => toast("Draft saving will connect to your backend service.")}>Save as draft</button><p className="form-note"><ShieldCheck size={14} /> Your employee identity comes from the authenticated session.</p></div></aside></form>}
  </div>;
}

function Journeys() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All journeys");
  const [selected, setSelected] = useState<Journey | null>(null);
  const filtered = useMemo(() => previewJourneys.filter((journey) => (filter === "All journeys" || journey.status === filter) && `${journey.destination} ${journey.project} ${journey.id}`.toLowerCase().includes(query.toLowerCase())), [query, filter]);
  return <div className="page-stack animate-page"><PageTitle meta={pageMeta["/employee/journeys"]} /><div className="panel table-panel"><div className="table-toolbar"><div className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search journeys" /></div><div className="toolbar-filters"><Filter size={15} /><select value={filter} onChange={(event) => setFilter(event.target.value)}><option>All journeys</option><option>Pending approval</option><option>Approved</option><option>Booked</option><option>Completed</option></select></div><Link href="/employee/plan-trip" className="button button-primary"><Plus size={16} /> Plan a trip</Link></div>{filtered.length ? <div className="responsive-table"><table><thead><tr><th>Journey</th><th>Dates</th><th>Project</th><th>Status</th><th /></tr></thead><tbody>{filtered.map((journey) => <tr key={journey.id} onClick={() => setSelected(journey)}><td><div className="table-journey"><span className="journey-icon"><Plane size={15} /></span><span><strong>{journey.destination}</strong><small>{journey.id} · {journey.from} → {journey.to}</small></span></div></td><td>{journey.dates}</td><td>{journey.project}</td><td><StatusBadge status={journey.status} /></td><td><ChevronRight size={16} className="row-chevron" /></td></tr>)}</tbody></table></div> : <EmptyState icon={<Compass size={20} />} title="No journeys match" description="Try another search or clear the current filter." />}</div>{selected && <JourneyDrawer journey={selected} onClose={() => setSelected(null)} />}</div>;
}

function JourneyDrawer({ journey, onClose }: { journey: Journey; onClose: () => void }) { return <><div className="drawer-overlay" onClick={onClose} /><aside className="journey-drawer"><div className="drawer-header"><div><span className="card-kicker">JOURNEY DETAIL</span><h2>{journey.destination}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close journey detail"><X size={18} /></button></div><div className="drawer-route"><div><span>From</span><strong>{journey.from}</strong></div><Plane size={18} /><div><span>To</span><strong>{journey.to}</strong></div></div><div className="drawer-status"><StatusBadge status={journey.status} /><span>{journey.id}</span></div><div className="drawer-details"><Detail label="Travel dates" value={journey.dates} icon={<CalendarDays size={16} />} /><Detail label="Trip type" value={journey.tripType} icon={<BriefcaseBusiness size={16} />} /><Detail label="Project" value={journey.project} icon={<FileText size={16} />} /><Detail label="Booking" value={journey.booking ?? "Not available yet"} icon={<TicketCheck size={16} />} /></div><div className="drawer-timeline"><span className="card-kicker">LIFECYCLE</span><TimelineItem label="Request submitted" done /><TimelineItem label="Manager approval" done={journey.status !== "Pending approval"} /><TimelineItem label="Travel desk booking" done={journey.status === "Booked" || journey.status === "Completed"} /><TimelineItem label="Trip completed" done={journey.status === "Completed"} last /></div></aside></>; }
function Detail({ label, value, icon }: { label: string; value: string; icon: ReactNode }) { return <div className="detail-row"><span className="detail-icon">{icon}</span><span><small>{label}</small><strong>{value}</strong></span></div>; }
function TimelineItem({ label, done, last }: { label: string; done?: boolean; last?: boolean }) { return <div className={`timeline-item ${done ? "done" : ""} ${last ? "last" : ""}`}><span className="timeline-dot">{done && <Check size={11} />}</span><span>{label}</span></div>; }

function Approvals({ history = false }: { history?: boolean }) { const [decision, setDecision] = useState<string | null>(null); return <div className="page-stack animate-page"><PageTitle meta={pageMeta[history ? "/approver/history" : "/approver"]} /><div className="summary-strip"><div><span className="card-kicker">{history ? "THIS QUARTER" : "NEEDS YOUR REVIEW"}</span><strong>{history ? "18" : "03"}</strong><span>{history ? "decisions recorded" : "requests waiting"}</span></div><div className="strip-icon"><FileCheck2 size={22} /></div></div><div className="panel table-panel"><div className="section-title-row"><div><span className="card-kicker">{history ? "DECISION LOG" : "PENDING REQUESTS"}</span><h2 className="section-heading">{history ? "Recent approval activity" : "Requests ready for review"}</h2></div><span className="data-note"><ShieldCheck size={13} /> Policy-aware</span></div><div className="approval-list">{approverRequests.map((request, index) => <div className="approval-item" key={request.id}><div className="approval-identity"><div className="avatar">{request.employee.split(".").map((part) => part[0]).join("")}</div><div><strong>{request.employee}</strong><span>{request.team} · {request.id}</span></div></div><div className="approval-route"><strong>{request.route}</strong><span>{request.dates} · {request.project}</span></div><div className="approval-amount"><span>Est. trip value</span><strong>{request.amount}</strong></div>{history ? <StatusBadge status={index === 2 ? "Rejected" : "Approved"} /> : <div className="approval-actions"><button className="button button-small button-ghost" onClick={() => setDecision(`reject-${request.id}`)}>Reject</button><button className="button button-small button-primary" onClick={() => setDecision(`approve-${request.id}`)}>Approve</button></div>}</div>)}</div></div>{decision && <ConfirmDialog action={decision.startsWith("approve") ? "approve" : "reject"} onClose={() => setDecision(null)} />}</div>; }
function ConfirmDialog({ action, onClose }: { action: "approve" | "reject"; onClose: () => void }) { const Icon = action === "approve" ? Check : XCircle; return <div className="modal-overlay"><div className="confirm-dialog"><button className="icon-button dialog-close" onClick={onClose}><X size={18} /></button><div className={`confirm-icon ${action}`}><Icon size={22} /></div><span className="card-kicker">CONFIRM DECISION</span><h2>{action === "approve" ? "Approve this request?" : "Reject this request?"}</h2><p>This is a preview action. The decision endpoint will be connected to your Spring Boot API and the employee will be notified.</p><div className="dialog-actions"><button className="button button-ghost" onClick={onClose}>Go back</button><button className={`button ${action === "approve" ? "button-primary" : "button-danger"}`} onClick={() => { onClose(); toast.success(`Preview ${action} recorded locally.`); }}>{action === "approve" ? "Approve request" : "Reject request"}</button></div></div></div>; }

function TravelDesk() { const rows = previewJourneys.filter((journey) => journey.status === "Approved" || journey.status === "Booked"); return <div className="page-stack animate-page"><PageTitle meta={pageMeta["/travel-desk"]} /><section className="ops-hero"><div><span className="card-kicker">TODAY IN OPERATIONS</span><h2>Keep the journey moving.</h2><p>Two trips need a travel desk touchpoint this week. Start with the booking queue.</p><Link href="/travel-desk/bookings" className="button button-primary">Open booking queue <ArrowUpRight size={16} /></Link></div><div className="ops-hero-metric"><span>Open work</span><strong>02</strong><small>approved trips</small></div></section><div className="stats-grid desk-stats"><StatCard label="Approved to book" value="02" detail="Open queue" icon={<Clock3 size={18} />} accent="stat-accent" /><StatCard label="Booked this month" value="12" detail="Preview data" icon={<TicketCheck size={18} />} /><StatCard label="Cancellations" value="01" detail="Needs review" icon={<XCircle size={18} />} /></div><div className="panel table-panel"><div className="section-title-row"><div><span className="card-kicker">OPERATIONS QUEUE</span><h2 className="section-heading">Approved travel requests</h2></div><span className="data-note"><Sparkles size={13} /> Preview data</span></div><div className="responsive-table"><table><thead><tr><th>Passenger</th><th>Route</th><th>Travel dates</th><th>Status</th><th>Action</th></tr></thead><tbody>{rows.map((row, index) => <tr key={row.id}><td><div className="table-journey"><span className="avatar avatar-tiny">{index === 0 ? "TW" : "RS"}</span><span><strong>{index === 0 ? "Preview workspace" : "R. Sharma"}</strong><small>{row.id} · {row.project}</small></span></div></td><td>{row.from} → {row.to}</td><td>{row.dates}</td><td><StatusBadge status={row.status === "Approved" ? "Booking pending" : row.status} /></td><td><button className="table-action" onClick={() => toast("Booking details will connect to your travel desk service.")}>{row.status === "Approved" ? "Add booking" : "View ticket"} <ArrowUpRight size={14} /></button></td></tr>)}</tbody></table></div></div></div>; }

function Reports() { const bars = [{ label: "Jul", value: 45 }, { label: "Aug", value: 72 }, { label: "Sep", value: 56 }, { label: "Oct", value: 86 }, { label: "Nov", value: 62 }, { label: "Dec", value: 38 }]; return <div className="page-stack animate-page"><PageTitle meta={pageMeta["/employee/reports"]} /><div className="report-header"><div><span className="card-kicker">TRAVEL INTELLIGENCE</span><h2>See the shape of your travel.</h2><p>Simple signals for planning ahead. Connect your reports endpoint to replace preview values with live activity.</p></div><button className="button button-ghost" onClick={() => toast("Export will connect to the reports service.")}><ArrowDownRight size={16} /> Export report</button></div><section className="report-grid"><div className="panel chart-panel"><div className="section-title-row"><div><span className="card-kicker">TRAVEL VOLUME</span><h2 className="section-heading">Requests over time</h2></div><span className="data-note"><Sparkles size={13} /> Preview data</span></div><div className="chart-area"><div className="chart-y"><span>12</span><span>08</span><span>04</span><span>00</span></div><div className="bars">{bars.map((bar) => <div className="bar-group" key={bar.label}><div className="bar-track"><div className="bar-fill" style={{ height: `${bar.value}%` }} /></div><span>{bar.label}</span></div>)}</div></div></div><div className="panel destination-panel"><div className="section-title-row"><div><span className="card-kicker">TOP DESTINATIONS</span><h2 className="section-heading">Where work takes you</h2></div><Compass size={18} className="panel-icon" /></div><div className="destination-list"><Destination name="Singapore" count="04 trips" width="86%" /><Destination name="London" count="03 trips" width="67%" /><Destination name="Dubai" count="02 trips" width="48%" /><Destination name="Frankfurt" count="01 trip" width="29%" /></div></div></section><section className="report-bottom"><div className="panel split-card"><span className="card-kicker">REQUEST OUTCOMES</span><div className="outcome-row"><div className="outcome-donut"><span>08</span><small>requests</small></div><div className="outcome-legend"><span><i className="legend-approved" />Approved <strong>06</strong></span><span><i className="legend-pending" />Pending <strong>01</strong></span><span><i className="legend-complete" />Completed <strong>01</strong></span></div></div></div><div className="panel insight-card"><div className="insight-symbol"><Sparkles size={18} /></div><div><span className="card-kicker">A SMALL INSIGHT</span><h3>September is your busiest travel month.</h3><p>Start approvals early to give the travel desk enough room to find the right fare.</p></div></div></section></div>; }
function Destination({ name, count, width }: { name: string; count: string; width: string }) { return <div className="destination-item"><div><strong>{name}</strong><span>{count}</span></div><div className="destination-track"><span style={{ width }} /></div></div>; }

function Support() { const faqs = [{ q: "How do I submit a travel request?", a: "Open Plan a trip, add your route, dates, project and business reason, then submit. Your employee identity is attached from the authenticated session." }, { q: "What happens after I submit?", a: "Your request moves to the assigned approver. Once approved, the Travel Desk can confirm the booking and attach ticket details." }, { q: "Can I cancel a journey?", a: "Eligible requests can be cancelled from the journey detail view. Cancellation eligibility and any fee rules come from your organization's policy." }, { q: "Where can I find my ticket?", a: "Open My journeys and select a booked trip. Your ticket number, airline and booking reference will appear as soon as the Travel Desk adds them." }]; const [open, setOpen] = useState(0); return <div className="page-stack animate-page"><PageTitle meta={pageMeta["/employee/support"]} /><section className="support-hero"><div className="support-symbol"><Headphones size={25} /></div><div><span className="card-kicker">TRAVORA HELP CENTER</span><h2>We’re here to keep work travel simple.</h2><p>Find a quick answer below, or reach out to your internal travel desk.</p></div><button className="button button-primary" onClick={() => toast("Support contact will connect to your internal help channel.")}>Contact travel desk <ArrowUpRight size={16} /></button></section><div className="support-grid"><div className="panel faq-panel"><div className="section-title-row"><div><span className="card-kicker">COMMON QUESTIONS</span><h2 className="section-heading">Frequently asked</h2></div><CircleHelp size={18} className="panel-icon" /></div><div className="faq-list">{faqs.map((faq, index) => <div className={`faq-item ${open === index ? "open" : ""}`} key={faq.q}><button onClick={() => setOpen(open === index ? -1 : index)}><span>{faq.q}</span><ChevronDown size={17} /></button>{open === index && <p>{faq.a}</p>}</div>)}</div></div><div className="panel support-links"><span className="card-kicker">GETTING STARTED</span><h2 className="section-heading">A smoother trip starts here.</h2><div className="support-link"><span className="support-link-icon"><FileText size={16} /></span><span><strong>Travel policy</strong><small>Know the essentials before you request.</small></span><ChevronRight size={15} /></div><div className="support-link"><span className="support-link-icon"><TicketCheck size={16} /></span><span><strong>Booking help</strong><small>Understand what happens after approval.</small></span><ChevronRight size={15} /></div><div className="support-link"><span className="support-link-icon"><WalletCards size={16} /></span><span><strong>Expense guidance</strong><small>Keep receipts and records together.</small></span><ChevronRight size={15} /></div></div></div></div>; }

function Admin({ section = "overview" }: { section?: string }) { const title = section === "employees" ? "People directory" : section === "requests" ? "Request activity" : section === "bookings" ? "Booking activity" : section === "reports" ? "Organization signals" : "Control center"; const items = [{ name: "Preview workspace", detail: "Product · Bengaluru", status: "Active" }, { name: "R. Sharma", detail: "Enterprise Sales · Mumbai", status: "Active" }, { name: "N. Mehta", detail: "Product · Delhi", status: "Active" }, { name: "S. Iyer", detail: "Engineering · Hyderabad", status: "On travel" }]; return <div className="page-stack animate-page"><PageTitle meta={{ ...pageMeta[section === "overview" ? "/admin" : `/admin/${section}`], title }} /><section className="admin-hero"><div><span className="card-kicker">ORGANIZATION VIEW</span><h2>Travel, with the bigger picture in view.</h2><p>Keep a pulse on people, requests and bookings without losing the details that matter.</p></div><div className="admin-orbit"><ShieldCheck size={22} /><span>Policy-aware workspace</span></div></section><section className="stats-grid"><StatCard label="Active employees" value="248" detail="Preview data" icon={<UsersRound size={18} />} /><StatCard label="Open requests" value="17" detail="Across teams" icon={<FileText size={18} />} accent="stat-accent" /><StatCard label="Booked this month" value="64" detail="+12% vs last month" icon={<TicketCheck size={18} />} /><StatCard label="Travel spend" value="₹ 18.4L" detail="Preview data" icon={<WalletCards size={18} />} /></section><div className="panel table-panel"><div className="section-title-row"><div><span className="card-kicker">{section === "employees" ? "DIRECTORY" : "LATEST ACTIVITY"}</span><h2 className="section-heading">{section === "employees" ? "Employees" : "What is moving across Travora"}</h2></div><div className="table-toolbar-actions"><button className="button button-ghost button-small" onClick={() => toast("Filters will connect to the admin API.")}><Filter size={14} /> Filter</button><button className="button button-primary button-small" onClick={() => toast("This action will connect to the admin service.")}><Plus size={14} /> Add record</button></div></div><div className="responsive-table"><table><thead><tr><th>Name</th><th>Department</th><th>Role / activity</th><th>Status</th><th /></tr></thead><tbody>{items.map((item, index) => <tr key={item.name}><td><div className="table-journey"><span className="avatar avatar-tiny">{item.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><span><strong>{item.name}</strong><small>{index === 0 ? "Authenticated preview account" : `EMP-00${index + 18}`}</small></span></div></td><td>{item.detail}</td><td>{index === 0 ? "Workspace owner" : index === 1 ? "Travel request" : index === 2 ? "Approval pending" : "Booked journey"}</td><td><span className="status-badge status-approved"><span className="status-dot" />{item.status}</span></td><td><ChevronRight size={16} className="row-chevron" /></td></tr>)}</tbody></table></div></div></div>; }

function Login() { const [loading, setLoading] = useState(false); const [email, setEmail] = useState(""); return <div className="login-page"><div className="login-brand"><Logo /><span>Employee Travel Booking & Management System</span></div><div className="login-layout"><div className="login-story"><span className="card-kicker">THE WORK TRIP, RECONSIDERED</span><h1>Travel well.<br /><em>Work better.</em></h1><p>One calm workspace for every business journey — from the first request to the flight home.</p><div className="login-story-footer"><div className="story-line" /><span>Built for modern teams</span></div></div><div className="login-card"><span className="card-kicker">WELCOME BACK</span><h2>Sign in to Travora</h2><p>Use your company credentials to continue.</p><form onSubmit={(event) => { event.preventDefault(); setLoading(true); setTimeout(() => { setLoading(false); toast.error("No backend connection is configured in this preview."); }, 700); }}><label className="field"><span>Email or username</span><input type="text" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@company.com" /></label><label className="field"><span>Password</span><input type="password" required placeholder="Enter your password" /></label><div className="login-options"><label className="checkbox-label"><input type="checkbox" /> <span>Remember me</span></label><button type="button" className="inline-link" onClick={() => toast("Password reset will connect to your authentication service.")}>Forgot password?</button></div><button type="submit" className="button button-primary button-wide" disabled={loading}>{loading ? "Signing in…" : "Sign in"}<ArrowUpRight size={16} /></button></form><div className="login-note"><ShieldCheck size={15} /><span>JWT authentication and role-based access are ready to connect to your existing Spring Boot backend.</span></div></div></div><div className="login-bottom"><span>Travora · Secure business travel management</span><span>Need help? Contact your travel desk</span></div></div>; }

function AppRouter() { const [location, setLocation] = useLocation(); const inferredRole: Role = location.startsWith("/approver") ? "APPROVER" : location.startsWith("/travel-desk") ? "TRAVEL_DESK" : location.startsWith("/admin") ? "ADMIN" : "EMPLOYEE"; const [role, setRole] = useState<Role>(inferredRole); const roleRoots: Record<Role, string> = { EMPLOYEE: "/employee", APPROVER: "/approver", TRAVEL_DESK: "/travel-desk", ADMIN: "/admin" }; const handleRoleChange = (nextRole: Role) => { setRole(nextRole); setLocation(roleRoots[nextRole]); }; if (location === "/login") return <Login />; const path = location === "/" ? "/employee" : location; let page: ReactNode; if (path === "/employee") page = <Dashboard />; else if (path === "/employee/plan-trip") page = <PlanTrip />; else if (path === "/employee/journeys") page = <Journeys />; else if (path === "/employee/approvals") page = <Approvals history />; else if (path === "/employee/reports") page = <Reports />; else if (path === "/employee/support") page = <Support />; else if (path === "/approver") page = <Approvals />; else if (path === "/approver/history") page = <Approvals history />; else if (path === "/travel-desk" || path === "/travel-desk/bookings" || path === "/travel-desk/cancellations") page = <TravelDesk />; else if (path.startsWith("/admin")) page = <Admin section={path === "/admin" ? "overview" : path.replace("/admin/", "")} />; else page = <Dashboard />; return <AppShell role={role} setRole={handleRoleChange}>{page}</AppShell>; }

function App() { return <ErrorBoundary><ThemeProvider defaultTheme="light"><Toaster position="bottom-right" /><AppRouter /></ThemeProvider></ErrorBoundary>; }

export default App;
