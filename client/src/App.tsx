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
  Moon,
  Plane,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  TicketCheck,
  UserRound,
  UsersRound,
  WalletCards,
  Eye,
  EyeOff,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { clearAuth, getStoredUser, getToken, login as loginApi, persistAuth, travelRequestsApi, dashboardApi, employeesApi, bookingsApi, type AuthUser, type Role } from "./lib/api";

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

type BackendRequest = Record<string, any>;

function formatRequestDate(value: unknown) {
  if (!value) return "—";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function mapRequestStatus(status: string | undefined): Journey["status"] {
  const normalized = (status || "PENDING").toUpperCase();
  if (normalized === "APPROVED") return "Approved";
  if (normalized === "BOOKED") return "Booked";
  if (normalized === "CANCELLED") return "Cancelled";
  if (normalized === "REJECTED") return "Rejected" as Journey["status"];
  if (normalized === "COMPLETED") return "Completed";
  return "Pending approval";
}

function toJourney(request: BackendRequest): Journey {
  const employee = request.employee || {};
  const dates = request.returnDate ? `${formatRequestDate(request.travelDate)} – ${formatRequestDate(request.returnDate)}` : formatRequestDate(request.travelDate);
  return { id: String(request.id), destination: request.toLocation || "Destination not provided", from: request.fromLocation || "Origin not provided", to: request.toLocation || "Destination not provided", dates, tripType: request.tripType || "Business", project: request.projectName || "—", status: mapRequestStatus(request.status), passenger: employee.name || employee.employeeId || undefined };
}

function useTravelRequests() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; travelRequestsApi.list().then((data) => { if (active) setJourneys(Array.isArray(data) ? data.map(toJourney) : []); }).catch((requestError) => { if (active) setError(requestError instanceof Error ? requestError.message : "Travel data is unavailable."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  return { journeys, loading, error };
}

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
      <div className="heading-actions"><span className="preview-chip"><ShieldCheck size={13} /> Secure workspace</span></div>
    </div>
  );
}

function Sidebar({ role, path, user, onLogout, onClose }: { role: Role; path: string; user: AuthUser; onLogout: () => void; onClose?: () => void }) {
  const initials = (user.username || "Travora").slice(0, 2).toUpperCase();
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
      <div className="nav-label">Authenticated account</div>
      <div className="role-account"><ShieldCheck size={15} /><span>{roleLabels[role]} access</span></div>
      <div className="sidebar-profile">
        <div className="avatar avatar-small">{initials}</div>
        <div className="profile-copy"><strong>{user.username}</strong><span>{user.employeeId || "Company account"}</span></div>
        <button className="icon-button" aria-label="Sign out" onClick={onLogout}><LogOut size={15} /></button>
      </div>
      <button className="logout-link" onClick={onLogout}><LogOut size={16} /> Sign out</button>
    </aside>
  );
}

function Topbar({ onMenu, meta, user }: { onMenu: () => void; meta: { title: string }; user: AuthUser }) {
  const { theme, toggleTheme } = useTheme();
  const initials = (user.username || "Travora").slice(0, 2).toUpperCase();
  return (
    <header className="topbar">
      <div className="topbar-left"><button className="icon-button mobile-only" aria-label="Open navigation" onClick={onMenu}><Menu size={20} /></button><div className="breadcrumb"><span>Travora</span><ChevronRight size={14} /><strong>{meta.title}</strong></div></div>
      <div className="topbar-actions"><button className="icon-button" aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`} onClick={toggleTheme}>{theme === "light" ? <Moon size={18} /> : <Sun size={18} />}</button><button className="icon-button notification-button" aria-label="Notifications" onClick={() => toast("You are all caught up.")}><Bell size={18} /><span className="notification-dot" /></button><div className="topbar-divider" /><div className="topbar-user"><div className="avatar avatar-small">{initials}</div><div className="topbar-user-copy"><strong>{user.username}</strong><span>{roleLabels[user.role]}</span></div><ChevronDown size={15} className="muted-icon" /></div></div>
    </header>
  );
}

function AppShell({ children, role, user, onLogout }: { children: ReactNode; role: Role; user: AuthUser; onLogout: () => void }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const path = location === "/" ? "/employee" : location;
  const meta = pageMeta[path] ?? pageMeta["/employee"];
  useEffect(() => setMobileOpen(false), [location]);
  return (
    <div className="app-shell">
      <div className={`sidebar-overlay ${mobileOpen ? "visible" : ""}`} onClick={() => setMobileOpen(false)} />
      <div className={`sidebar-drawer ${mobileOpen ? "open" : ""}`}><Sidebar role={role} path={path} user={user} onLogout={onLogout} onClose={() => setMobileOpen(false)} /></div>
      <div className="desktop-sidebar"><Sidebar role={role} path={path} user={user} onLogout={onLogout} /></div>
      <div className="app-main"><Topbar onMenu={() => setMobileOpen(true)} meta={meta} user={user} /><main className="content-wrap">{children}</main></div>
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
  const { journeys, loading } = useTravelRequests();
  const upcoming = journeys.find((journey) => journey.status === "Approved" || journey.status === "Booked" || journey.status === "Pending approval");
  const stats = { total: journeys.length, upcoming: journeys.filter((journey) => journey.status === "Approved" || journey.status === "Booked").length, pending: journeys.filter((journey) => journey.status === "Pending approval").length, completed: journeys.filter((journey) => journey.status === "Completed").length };
  return <div className="page-stack animate-page">
    <PageTitle meta={pageMeta["/employee"]} />
    <section className="welcome-grid">
      <div className="welcome-card"><div className="welcome-copy"><span className="card-kicker">AUTHENTICATED EMPLOYEE WORKSPACE</span><h2>Make every work trip count.</h2><p>Plan, track and manage your business travel without losing sight of the details.</p><div className="welcome-actions"><Link href="/employee/plan-trip" className="button button-primary"><Plus size={17} /> Plan a trip</Link><Link href="/employee/journeys" className="button button-ghost">View journeys <ArrowUpRight size={16} /></Link></div></div><div className="welcome-orbit"><div className="orbit-ring orbit-ring-one" /><div className="orbit-ring orbit-ring-two" /><div className="orbit-core"><Plane size={27} /></div><span className="orbit-label orbit-label-one">Plan</span><span className="orbit-label orbit-label-two">Approve</span><span className="orbit-label orbit-label-three">Go</span></div></div>
      <div className="upcoming-card"><div className="section-title-row"><div><span className="card-kicker">NEXT JOURNEY</span><h3>{upcoming?.destination || "No upcoming journeys"}</h3></div><span className="round-arrow"><ArrowUpRight size={17} /></span></div>{upcoming ? <><div className="route-line"><span>{upcoming.from}</span><span className="route-track"><span className="route-dot" /><span className="route-dash" /><Plane size={14} /></span><span>{upcoming.to}</span></div><div className="upcoming-meta"><div><CalendarDays size={15} /><span>{upcoming.dates}</span></div><div><BriefcaseBusiness size={15} /><span>{upcoming.project}</span></div></div><div className="upcoming-status"><StatusBadge status={upcoming.status} /><span>Current status from Travora</span></div></> : <EmptyState icon={<Compass size={20} />} title={loading ? "Loading journeys" : "No journeys yet"} description={loading ? "Fetching your travel activity." : "Your submitted travel requests will appear here."} action={!loading && <Link className="button button-primary button-small" href="/employee/plan-trip">Plan a trip</Link>} />}</div>
    </section>
    <div className="section-title-row section-title-spaced"><div><span className="card-kicker">AT A GLANCE</span><h2 className="section-heading">Your travel pulse</h2></div><span className="data-note"><ShieldCheck size={13} /> Live backend data</span></div>
    <section className="stats-grid"><StatCard label="Total trips" value={String(stats.total).padStart(2, "0")} detail="From your account" icon={<Compass size={18} />} /><StatCard label="Upcoming trips" value={String(stats.upcoming).padStart(2, "0")} detail="Approved or booked" icon={<CalendarDays size={18} />} accent="stat-accent" /><StatCard label="Pending requests" value={String(stats.pending).padStart(2, "0")} detail="Needs approval" icon={<Clock3 size={18} />} /><StatCard label="Completed trips" value={String(stats.completed).padStart(2, "0")} detail="From your account" icon={<Check size={18} />} /></section>
    <section className="dashboard-lower-grid"><div className="panel recent-panel"><div className="section-title-row"><div><span className="card-kicker">RECENT ACTIVITY</span><h2 className="section-heading">My journeys</h2></div><Link href="/employee/journeys" className="text-link">View all <ArrowUpRight size={14} /></Link></div><div className="journey-list">{journeys.length ? journeys.slice(0, 3).map((journey) => <JourneyRow key={journey.id} journey={journey} />) : <EmptyState icon={<Compass size={20} />} title={loading ? "Loading journeys" : "No journeys yet"} description={loading ? "Fetching your travel activity." : "Your submitted travel requests will appear here."} />}</div></div><div className="panel status-panel"><div className="section-title-row"><div><span className="card-kicker">REQUEST FLOW</span><h2 className="section-heading">Where things stand</h2></div><Compass size={18} className="panel-icon" /></div><div className="flow-list"><FlowItem label="Pending approval" count={String(stats.pending).padStart(2, "0")} tone="pending" /><FlowItem label="Approved" count={String(journeys.filter((journey) => journey.status === "Approved").length).padStart(2, "0")} tone="approved" /><FlowItem label="Booked" count={String(journeys.filter((journey) => journey.status === "Booked").length).padStart(2, "0")} tone="booked" /><FlowItem label="Completed" count={String(stats.completed).padStart(2, "0")} tone="completed" /></div><Link href="/employee/reports" className="panel-footer-link">See travel reports <ArrowRightIcon /></Link></div></section>
  </div>;
}
function ArrowRightIcon() { return <ChevronRight size={15} />; }

function FlowItem({ label, count, tone }: { label: string; count: string; tone: string }) { return <div className="flow-item"><span className={`flow-marker marker-${tone}`} /><span>{label}</span><strong>{count}</strong></div>; }

function JourneyRow({ journey }: { journey: Journey }) {
  return <Link href={`/employee/journeys?journey=${journey.id}`} className="journey-row"><div className="journey-icon"><Plane size={16} /></div><div className="journey-main"><strong>{journey.destination}</strong><span>{journey.from} → {journey.to} · {journey.dates}</span></div><div className="journey-project">{journey.project}</div><StatusBadge status={journey.status} /><ChevronRight size={16} className="row-chevron" /></Link>;
}

function PlanTrip() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  async function submitTrip(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await travelRequestsApi.create({ tripType: form.get("tripType"), fromLocation: form.get("fromLocation"), toLocation: form.get("toLocation"), travelDate: form.get("travelDate"), returnDate: form.get("returnDate"), projectName: form.get("projectName"), reason: form.get("reason") });
      setSubmitted(true);
      toast.success("Travel request submitted for approval.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We couldn't submit your request.");
    } finally { setSubmitting(false); }
  }
  return <div className="page-stack animate-page"><PageTitle meta={pageMeta["/employee/plan-trip"]} />
    {submitted ? <div className="success-card"><div className="success-mark"><Check size={22} /></div><div><span className="card-kicker">REQUEST SUBMITTED</span><h2>Your request is with your approver.</h2><p>Travora has sent the travel request to the existing Spring Boot workflow. You can follow its status from My journeys.</p><div className="welcome-actions"><button className="button button-primary" onClick={() => setSubmitted(false)}>Create another request</button><Link href="/employee/journeys" className="button button-ghost">View journeys <ArrowUpRight size={16} /></Link></div></div></div> : <form className="form-layout" onSubmit={submitTrip}><div className="panel form-panel"><div className="form-intro"><span className="card-kicker">TRAVEL REQUEST</span><h2>Tell us about the trip</h2><p>These details help your approver and travel desk move quickly.</p></div><div className="form-section"><div className="form-section-heading"><span>01</span><div><h3>Trip details</h3><p>Start with the basics of your journey.</p></div></div><div className="form-grid"><label className="field"><span>Trip type</span><select name="tripType" defaultValue="BUSINESS"><option value="BUSINESS">Business</option><option value="CONFERENCE">Conference</option><option value="TRAINING">Training</option></select></label><label className="field"><span>From location</span><div className="input-with-icon"><Compass size={16} /><input name="fromLocation" required placeholder="City or airport" /></div></label><label className="field"><span>To location</span><div className="input-with-icon"><Plane size={16} /><input name="toLocation" required placeholder="City or airport" /></div></label><label className="field"><span>Travel date</span><div className="input-with-icon"><CalendarDays size={16} /><input name="travelDate" required type="date" /></div></label><label className="field"><span>Return date</span><div className="input-with-icon"><CalendarDays size={16} /><input name="returnDate" required type="date" /></div></label><label className="field"><span>Project name</span><input name="projectName" required placeholder="e.g. APAC launch" /></label></div></div><div className="form-section"><div className="form-section-heading"><span>02</span><div><h3>Business context</h3><p>Give your approver the context they need.</p></div></div><label className="field"><span>Reason for travel</span><textarea name="reason" required placeholder="What is the purpose of this trip?" rows={4} /></label></div>{error && <div className="form-error-message"><XCircle size={15} />{error}</div>}</div><aside className="form-aside"><div className="aside-card aside-dark"><Sparkles size={18} /><h3>Built for the way work moves.</h3><p>Travora keeps the request, approval and booking context together so no detail gets lost in the handoff.</p><div className="aside-line" /><span>Authenticated employee context will be attached automatically.</span></div><div className="aside-card"><div className="section-title-row"><span className="card-kicker">BEFORE YOU SUBMIT</span><Check size={16} className="check-icon" /></div><ul className="check-list"><li><Check size={14} /> Dates are accurate</li><li><Check size={14} /> Project is correctly named</li><li><Check size={14} /> Reason is clear to your approver</li></ul></div><div className="form-actions"><button type="submit" className="button button-primary button-wide" disabled={submitting}>{submitting ? "Submitting…" : "Submit request"} <ArrowUpRight size={16} /></button><button type="button" className="button button-ghost button-wide" onClick={() => toast("Draft saving is not part of the inspected backend contract yet.")}>Save as draft</button><p className="form-note"><ShieldCheck size={14} /> Your employee identity comes from the authenticated JWT session.</p></div></aside></form>}
  </div>;
}

function Journeys() {
  const { journeys, loading, error } = useTravelRequests();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All journeys");
  const [selected, setSelected] = useState<Journey | null>(null);
  const filtered = useMemo(() => journeys.filter((journey) => (filter === "All journeys" || journey.status === filter) && `${journey.destination} ${journey.project} ${journey.id}`.toLowerCase().includes(query.toLowerCase())), [journeys, query, filter]);
  return <div className="page-stack animate-page"><PageTitle meta={pageMeta["/employee/journeys"]} /><div className="panel table-panel"><div className="table-toolbar"><div className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search journeys" /></div><div className="toolbar-filters"><Filter size={15} /><select value={filter} onChange={(event) => setFilter(event.target.value)}><option>All journeys</option><option>Pending approval</option><option>Approved</option><option>Booked</option><option>Completed</option><option>Cancelled</option></select></div><Link href="/employee/plan-trip" className="button button-primary"><Plus size={16} /> Plan a trip</Link></div>{error && <div className="form-error-message"><XCircle size={15} />{error}</div>}{loading ? <EmptyState icon={<Clock3 size={20} />} title="Loading journeys" description="Fetching your travel activity from Travora." /> : filtered.length ? <div className="responsive-table"><table><thead><tr><th>Journey</th><th>Dates</th><th>Project</th><th>Status</th><th /></tr></thead><tbody>{filtered.map((journey) => <tr key={journey.id} onClick={() => setSelected(journey)}><td><div className="table-journey"><span className="journey-icon"><Plane size={15} /></span><span><strong>{journey.destination}</strong><small>{journey.id} · {journey.from} → {journey.to}</small></span></div></td><td>{journey.dates}</td><td>{journey.project}</td><td><StatusBadge status={journey.status} /></td><td><ChevronRight size={16} className="row-chevron" /></td></tr>)}</tbody></table></div> : <EmptyState icon={<Compass size={20} />} title="No journeys yet" description="Your submitted travel requests will appear here." action={<Link className="button button-primary button-small" href="/employee/plan-trip">Plan a trip</Link>} />}</div>{selected && <JourneyDrawer journey={selected} onClose={() => setSelected(null)} />}</div>;
}
function JourneyDrawer({ journey, onClose }: { journey: Journey; onClose: () => void }) { return <><div className="drawer-overlay" onClick={onClose} /><aside className="journey-drawer"><div className="drawer-header"><div><span className="card-kicker">JOURNEY DETAIL</span><h2>{journey.destination}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close journey detail"><X size={18} /></button></div><div className="drawer-route"><div><span>From</span><strong>{journey.from}</strong></div><Plane size={18} /><div><span>To</span><strong>{journey.to}</strong></div></div><div className="drawer-status"><StatusBadge status={journey.status} /><span>{journey.id}</span></div><div className="drawer-details"><Detail label="Travel dates" value={journey.dates} icon={<CalendarDays size={16} />} /><Detail label="Trip type" value={journey.tripType} icon={<BriefcaseBusiness size={16} />} /><Detail label="Project" value={journey.project} icon={<FileText size={16} />} /><Detail label="Booking" value={journey.booking ?? "Not available yet"} icon={<TicketCheck size={16} />} /></div><div className="drawer-timeline"><span className="card-kicker">LIFECYCLE</span><TimelineItem label="Request submitted" done /><TimelineItem label="Manager approval" done={journey.status !== "Pending approval"} /><TimelineItem label="Travel desk booking" done={journey.status === "Booked" || journey.status === "Completed"} /><TimelineItem label="Trip completed" done={journey.status === "Completed"} last /></div></aside></>; }
function Detail({ label, value, icon }: { label: string; value: string; icon: ReactNode }) { return <div className="detail-row"><span className="detail-icon">{icon}</span><span><small>{label}</small><strong>{value}</strong></span></div>; }
function TimelineItem({ label, done, last }: { label: string; done?: boolean; last?: boolean }) { return <div className={`timeline-item ${done ? "done" : ""} ${last ? "last" : ""}`}><span className="timeline-dot">{done && <Check size={11} />}</span><span>{label}</span></div>; }

function Approvals({ history = false }: { history?: boolean }) {
  const { journeys, loading, error } = useTravelRequests();
  const [working, setWorking] = useState<string | null>(null);
  const user = getStoredUser<AuthUser>();
  async function decide(journey: Journey, action: "approve" | "reject") { setWorking(`${action}-${journey.id}`); try { const approver = user?.username || "authenticated approver"; if (action === "approve") await travelRequestsApi.approve(journey.id, approver); else await travelRequestsApi.reject(journey.id, approver, "Rejected from Travora approval workspace."); toast.success(`Request ${action === "approve" ? "approved" : "rejected"}.`); window.location.reload(); } catch (decisionError) { toast.error(decisionError instanceof Error ? decisionError.message : "Decision could not be saved."); } finally { setWorking(null); } }
  const rows = history ? journeys.filter((journey) => journey.status !== "Pending approval") : journeys.filter((journey) => journey.status === "Pending approval");
  return <div className="page-stack animate-page"><PageTitle meta={pageMeta[history ? "/approver/history" : "/approver"]} /><div className="summary-strip"><div><span className="card-kicker">{history ? "DECISION LOG" : "NEEDS YOUR REVIEW"}</span><strong>{String(rows.length).padStart(2, "0")}</strong><span>{history ? "decisions recorded" : "requests waiting"}</span></div><div className="strip-icon"><FileCheck2 size={22} /></div></div><div className="panel table-panel"><div className="section-title-row"><div><span className="card-kicker">{history ? "BACKEND HISTORY" : "PENDING REQUESTS"}</span><h2 className="section-heading">{history ? "Recent approval activity" : "Requests ready for review"}</h2></div><span className="data-note"><ShieldCheck size={13} /> Live backend data</span></div>{error && <div className="form-error-message"><XCircle size={15} />{error}</div>}{loading ? <EmptyState icon={<Clock3 size={20} />} title="Loading approvals" description="Fetching requests from Travora." /> : rows.length ? <div className="approval-list">{rows.map((request) => <div className="approval-item" key={request.id}><div className="approval-identity"><div className="avatar">{request.destination.slice(0, 2).toUpperCase()}</div><div><strong>{request.destination}</strong><span>{request.id} · {request.project}</span></div></div><div className="approval-route"><strong>{request.from} → {request.to}</strong><span>{request.dates} · {request.tripType}</span></div><div className="approval-amount"><span>Status</span><StatusBadge status={request.status} /></div>{history ? <StatusBadge status={request.status} /> : <div className="approval-actions"><button className="button button-small button-ghost" disabled={working !== null} onClick={() => decide(request, "reject")}>{working === `reject-${request.id}` ? "Saving…" : "Reject"}</button><button className="button button-small button-primary" disabled={working !== null} onClick={() => decide(request, "approve")}>{working === `approve-${request.id}` ? "Saving…" : "Approve"}</button></div>}</div>)}</div> : <EmptyState icon={<FileCheck2 size={20} />} title={history ? "No decisions yet" : "No requests waiting"} description={history ? "Completed approval decisions will appear here." : "New pending requests will appear here when submitted."} />}</div></div>;
}
function ConfirmDialog({ action, onClose }: { action: "approve" | "reject"; onClose: () => void }) { const Icon = action === "approve" ? Check : XCircle; return <div className="modal-overlay"><div className="confirm-dialog"><button className="icon-button dialog-close" onClick={onClose}><X size={18} /></button><div className={`confirm-icon ${action}`}><Icon size={22} /></div><span className="card-kicker">CONFIRM DECISION</span><h2>{action === "approve" ? "Approve this request?" : "Reject this request?"}</h2><p>This is a preview action. The decision endpoint will be connected to your Spring Boot API and the employee will be notified.</p><div className="dialog-actions"><button className="button button-ghost" onClick={onClose}>Go back</button><button className={`button ${action === "approve" ? "button-primary" : "button-danger"}`} onClick={() => { onClose(); toast.success(`Preview ${action} recorded locally.`); }}>{action === "approve" ? "Approve request" : "Reject request"}</button></div></div></div>; }

function TravelDesk() {
  const { journeys, loading, error } = useTravelRequests();
  const rows = journeys.filter((journey) => journey.status === "Approved" || journey.status === "Booked");
  return <div className="page-stack animate-page"><PageTitle meta={pageMeta["/travel-desk"]} /><section className="ops-hero"><div><span className="card-kicker">TODAY IN OPERATIONS</span><h2>Keep the journey moving.</h2><p>Approved journeys returned by the backend are ready for booking action.</p><Link href="/travel-desk/bookings" className="button button-primary">Open booking queue <ArrowUpRight size={16} /></Link></div><div className="ops-hero-metric"><span>Open work</span><strong>{String(rows.filter((row) => row.status === "Approved").length).padStart(2, "0")}</strong><small>approved trips</small></div></section><div className="stats-grid desk-stats"><StatCard label="Approved to book" value={String(rows.filter((row) => row.status === "Approved").length).padStart(2, "0")} detail="Live queue" icon={<Clock3 size={18} />} accent="stat-accent" /><StatCard label="Booked" value={String(rows.filter((row) => row.status === "Booked").length).padStart(2, "0")} detail="Live backend data" icon={<TicketCheck size={18} />} /><StatCard label="Cancellations" value={String(journeys.filter((row) => row.status === "Cancelled").length).padStart(2, "0")} detail="Current status" icon={<XCircle size={18} />} /></div><div className="panel table-panel"><div className="section-title-row"><div><span className="card-kicker">OPERATIONS QUEUE</span><h2 className="section-heading">Approved travel requests</h2></div><span className="data-note"><ShieldCheck size={13} /> Live backend data</span></div>{error && <div className="form-error-message"><XCircle size={15} />{error}</div>}{loading ? <EmptyState icon={<Clock3 size={20} />} title="Loading queue" description="Fetching approved requests from Travora." /> : rows.length ? <div className="responsive-table"><table><thead><tr><th>Journey</th><th>Route</th><th>Travel dates</th><th>Status</th><th>Action</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><div className="table-journey"><span className="avatar avatar-tiny">{row.destination.slice(0, 2).toUpperCase()}</span><span><strong>{row.destination}</strong><small>{row.id} · {row.project}</small></span></div></td><td>{row.from} → {row.to}</td><td>{row.dates}</td><td><StatusBadge status={row.status === "Approved" ? "Booking pending" : row.status} /></td><td><button className="table-action" onClick={() => toast("Booking creation is available through the connected /api/bookings endpoint.")}>{row.status === "Approved" ? "Add booking" : "View ticket"} <ArrowUpRight size={14} /></button></td></tr>)}</tbody></table></div> : <EmptyState icon={<TicketCheck size={20} />} title="No approved journeys" description="Approved travel requests will appear here for ticketing." />}</div></div>;
}
function Reports() {
  const { journeys, loading } = useTravelRequests();
  const counts = { approved: journeys.filter((j) => j.status === "Approved").length, pending: journeys.filter((j) => j.status === "Pending approval").length, completed: journeys.filter((j) => j.status === "Completed").length };
  const destinations = Array.from(new Set(journeys.map((j) => j.destination))).slice(0, 4);
  return <div className="page-stack animate-page"><PageTitle meta={pageMeta["/employee/reports"]} /><div className="report-header"><div><span className="card-kicker">LIVE TRAVEL DATA</span><h2>Patterns that help you plan ahead.</h2><p>These signals are calculated from the travel requests returned for your authenticated account.</p></div><div className="report-period"><CalendarDays size={16} /> Current account</div></div><section className="stats-grid"><StatCard label="Total requests" value={String(journeys.length).padStart(2, "0")} detail={loading ? "Loading" : "From backend"} icon={<FileText size={18} />} /><StatCard label="Approved" value={String(counts.approved).padStart(2, "0")} detail="Current status" icon={<Check size={18} />} accent="stat-accent" /><StatCard label="Pending" value={String(counts.pending).padStart(2, "0")} detail="Needs approval" icon={<Clock3 size={18} />} /><StatCard label="Completed" value={String(counts.completed).padStart(2, "0")} detail="Current status" icon={<Compass size={18} />} /></section><section className="report-grid"><div className="panel destination-panel"><div className="section-title-row"><div><span className="card-kicker">DESTINATIONS</span><h2 className="section-heading">Where work takes you</h2></div><Compass size={18} className="panel-icon" /></div>{destinations.length ? <div className="destination-list">{destinations.map((destination, index) => <Destination key={destination} name={destination} count={`${journeys.filter((j) => j.destination === destination).length} request${journeys.filter((j) => j.destination === destination).length === 1 ? "" : "s"}`} width={`${86 - index * 17}%`} />)}</div> : <EmptyState icon={<Compass size={20} />} title="No destination data yet" description="Submit a travel request to build your report." />}</div><div className="panel insight-card"><div className="insight-symbol"><Sparkles size={18} /></div><div><span className="card-kicker">TRAVORA SIGNAL</span><h3>{loading ? "Loading your travel signal" : journeys.length ? "Keep the request context close." : "Your first request starts the signal."}</h3><p>{loading ? "Fetching the latest request activity." : journeys.length ? "Approval and booking teams can use the same request record to keep the handoff clear." : "Create a request to see destinations, statuses and travel patterns here."}</p></div></div></section></div>;
}
function Destination({ name, count, width }: { name: string; count: string; width: string }) { return <div className="destination-item"><div><strong>{name}</strong><span>{count}</span></div><div className="destination-track"><span style={{ width }} /></div></div>; }

function Support() { const faqs = [{ q: "How do I submit a travel request?", a: "Open Plan a trip, add your route, dates, project and business reason, then submit. Your employee identity is attached from the authenticated session." }, { q: "What happens after I submit?", a: "Your request moves to the assigned approver. Once approved, the Travel Desk can confirm the booking and attach ticket details." }, { q: "Can I cancel a journey?", a: "Eligible requests can be cancelled from the journey detail view. Cancellation eligibility and any fee rules come from your organization's policy." }, { q: "Where can I find my ticket?", a: "Open My journeys and select a booked trip. Your ticket number, airline and booking reference will appear as soon as the Travel Desk adds them." }]; const [open, setOpen] = useState(0); return <div className="page-stack animate-page"><PageTitle meta={pageMeta["/employee/support"]} /><section className="support-hero"><div className="support-symbol"><Headphones size={25} /></div><div><span className="card-kicker">TRAVORA HELP CENTER</span><h2>We’re here to keep work travel simple.</h2><p>Find a quick answer below, or reach out to your internal travel desk.</p></div><button className="button button-primary" onClick={() => toast("Support contact will connect to your internal help channel.")}>Contact travel desk <ArrowUpRight size={16} /></button></section><div className="support-grid"><div className="panel faq-panel"><div className="section-title-row"><div><span className="card-kicker">COMMON QUESTIONS</span><h2 className="section-heading">Frequently asked</h2></div><CircleHelp size={18} className="panel-icon" /></div><div className="faq-list">{faqs.map((faq, index) => <div className={`faq-item ${open === index ? "open" : ""}`} key={faq.q}><button onClick={() => setOpen(open === index ? -1 : index)}><span>{faq.q}</span><ChevronDown size={17} /></button>{open === index && <p>{faq.a}</p>}</div>)}</div></div><div className="panel support-links"><span className="card-kicker">GETTING STARTED</span><h2 className="section-heading">A smoother trip starts here.</h2><div className="support-link"><span className="support-link-icon"><FileText size={16} /></span><span><strong>Travel policy</strong><small>Know the essentials before you request.</small></span><ChevronRight size={15} /></div><div className="support-link"><span className="support-link-icon"><TicketCheck size={16} /></span><span><strong>Booking help</strong><small>Understand what happens after approval.</small></span><ChevronRight size={15} /></div><div className="support-link"><span className="support-link-icon"><WalletCards size={16} /></span><span><strong>Expense guidance</strong><small>Keep receipts and records together.</small></span><ChevronRight size={15} /></div></div></div></div>; }

function Admin({ section = "overview" }: { section?: string }) {
  const [summary, setSummary] = useState<Record<string, number> | null>(null);
  const [employees, setEmployees] = useState<Array<Record<string, string>>>([]);
  const [error, setError] = useState("");
  useEffect(() => { Promise.all([dashboardApi.summary(), employeesApi.list()]).then(([nextSummary, nextEmployees]) => { setSummary(nextSummary as Record<string, number>); setEmployees(Array.isArray(nextEmployees) ? nextEmployees as Array<Record<string, string>> : []); }).catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Admin data is unavailable.")); }, []);
  const title = section === "employees" ? "People directory" : section === "requests" ? "Request activity" : section === "bookings" ? "Booking activity" : section === "reports" ? "Organization signals" : "Control center";
  return <div className="page-stack animate-page"><PageTitle meta={{ ...pageMeta[section === "overview" ? "/admin" : `/admin/${section}`], title }} /><section className="admin-hero"><div><span className="card-kicker">ORGANIZATION VIEW</span><h2>Travel, with the bigger picture in view.</h2><p>Monitor people, requests and bookings from the authenticated admin workspace.</p></div><div className="admin-orbit"><ShieldCheck size={22} /><span>Policy-aware workspace</span></div></section>{error && <div className="form-error-message"><XCircle size={15} />{error}</div>}<section className="stats-grid"><StatCard label="Active employees" value={String(employees.length || 0)} detail="From backend" icon={<UsersRound size={18} />} /><StatCard label="Open requests" value={String(summary?.pendingRequests || 0)} detail="Pending" icon={<FileText size={18} />} accent="stat-accent" /><StatCard label="Total bookings" value={String(summary?.totalBookings || 0)} detail="From backend" icon={<TicketCheck size={18} />} /><StatCard label="Travel requests" value={String(summary?.totalTravelRequests || 0)} detail="All statuses" icon={<WalletCards size={18} />} /></section><div className="panel table-panel"><div className="section-title-row"><div><span className="card-kicker">{section === "employees" ? "DIRECTORY" : "LATEST ACTIVITY"}</span><h2 className="section-heading">{section === "employees" ? "Employees" : "Backend summary"}</h2></div></div>{employees.length ? <div className="responsive-table"><table><thead><tr><th>Name</th><th>Department</th><th>Designation</th><th>Employee ID</th><th /></tr></thead><tbody>{employees.map((employee, index) => <tr key={employee.id || employee.employeeId || index}><td><div className="table-journey"><span className="avatar avatar-tiny">{String(employee.name || "E").slice(0, 2).toUpperCase()}</span><span><strong>{employee.name || "Unnamed employee"}</strong><small>{employee.employeeId || "—"}</small></span></div></td><td>{employee.department || "—"}</td><td>{employee.designation || "—"}</td><td>{employee.employeeId || "—"}</td><td><ChevronRight size={16} className="row-chevron" /></td></tr>)}</tbody></table></div> : <EmptyState icon={<UsersRound size={20} />} title="No employee data returned" description="The admin directory will populate from the connected backend." />}</div></div>;
}
function Login({ onAuthenticated }: { onAuthenticated: (user: AuthUser) => void }) {
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    try { const data = await loginApi({ username, password }); persistAuth(data); onAuthenticated(data); }
    catch (loginError) { setError(loginError instanceof Error ? (loginError.message.includes("401") ? "Invalid username or password." : loginError.message) : "Unable to sign in."); }
    finally { setLoading(false); }
  }
  return <div className="login-page"><button className="login-theme-toggle icon-button" aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`} onClick={toggleTheme}>{theme === "light" ? <Moon size={18} /> : <Sun size={18} />}</button><div className="login-brand"><Logo /><span>Employee Travel Booking & Management System</span></div><div className="login-layout"><div className="login-story"><span className="card-kicker">THE WORK TRIP, RECONSIDERED</span><h1>Travel well.<br /><em>Work better.</em></h1><p>One calm workspace for every business journey — from the first request to the flight home.</p><div className="login-story-footer"><div className="story-line" /><span>Authorized company access</span></div></div><div className="login-card"><span className="card-kicker">WELCOME BACK</span><h2>Sign in to Travora</h2><p>Use your company credentials to continue.</p><form onSubmit={submit}><label className="field"><span>Company username</span><input type="text" value={username} onChange={(event) => setUsername(event.target.value)} required autoComplete="username" placeholder="Enter your username" /></label><label className="field"><span>Password</span><div className="password-field"><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" placeholder="Enter your password" /><button type="button" className="password-toggle" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>{error && <div className="form-error-message"><XCircle size={15} />{error}</div>}<div className="login-options"><span className="login-security"><ShieldCheck size={14} /> Company access only</span><button type="button" className="inline-link" onClick={() => toast("Please contact your company administrator to reset your password.")}>Need help?</button></div><button type="submit" className="button button-primary button-wide" disabled={loading}>{loading ? "Signing in…" : "Sign in"}<ArrowUpRight size={16} /></button></form><div className="login-note"><ShieldCheck size={15} /><span>Authentication is handled by your existing Spring Security and JWT backend. Your role is detected after sign in.</span></div></div></div><div className="login-bottom"><span>Travora · Secure business travel management</span><span>Need help? Contact your travel desk</span></div></div>;
}

function AppRouter() {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<AuthUser | null>(() => getToken() ? getStoredUser<AuthUser>() : null);
  const path = location === "/" ? "/employee" : location;
  const role = user?.role;
  const roleRoots: Record<Role, string> = { EMPLOYEE: "/employee", APPROVER: "/approver", TRAVEL_DESK: "/travel-desk", ADMIN: "/admin" };
  const protectedPrefixes: Record<Role, string[]> = { EMPLOYEE: ["/employee"], APPROVER: ["/approver"], TRAVEL_DESK: ["/travel-desk"], ADMIN: ["/admin"] };
  const onLogout = () => { clearAuth(); setUser(null); setLocation("/login"); };
  const allowed = user && role ? protectedPrefixes[role].some((prefix) => path === prefix || path.startsWith(`${prefix}/`)) || (role !== "EMPLOYEE" && path === "/employee/reports") || (role !== "EMPLOYEE" && path === "/employee/support") : false;
  useEffect(() => { if (!user && location !== "/login") setLocation("/login"); else if (user && location === "/login") setLocation(roleRoots[user.role]); else if (user && !allowed) setLocation(roleRoots[user.role]); }, [user, location, allowed, setLocation]);
  if (location === "/login") return <Login onAuthenticated={(nextUser) => { setUser(nextUser); setLocation(roleRoots[nextUser.role]); }} />;
  if (!user || !role) return null;
  if (!allowed) return null;
  let page: ReactNode;
  if (path === "/employee") page = <Dashboard />; else if (path === "/employee/plan-trip") page = <PlanTrip />; else if (path === "/employee/journeys") page = <Journeys />; else if (path === "/employee/approvals") page = <Approvals history />; else if (path === "/employee/reports") page = <Reports />; else if (path === "/employee/support") page = <Support />; else if (path === "/approver") page = <Approvals />; else if (path === "/approver/history") page = <Approvals history />; else if (path === "/travel-desk" || path === "/travel-desk/bookings" || path === "/travel-desk/cancellations") page = <TravelDesk />; else if (path.startsWith("/admin")) page = <Admin section={path === "/admin" ? "overview" : path.replace("/admin/", "")} />; else page = <Dashboard />;
  return <AppShell role={role} user={user} onLogout={onLogout}>{page}</AppShell>;
}

function App() { return <ErrorBoundary><ThemeProvider><Toaster position="bottom-right" /><AppRouter /></ThemeProvider></ErrorBoundary>; }

export default App;
