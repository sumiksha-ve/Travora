from pathlib import Path

path = Path('/home/ubuntu/travora/client/src/App.tsx')
text = path.read_text()

marker = 'const approverRequests = ['
helper = '''type BackendRequest = Record<string, any>;

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

'''
if 'function useTravelRequests()' not in text:
    text = text.replace(marker, helper + marker)

start = text.index('function Dashboard() {')
end = text.index('\nfunction ArrowRightIcon()', start)
dashboard = '''function Dashboard() {
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
}'''
text = text[:start] + dashboard + text[end:]

start = text.index('function Journeys() {')
end = text.index('\nfunction JourneyDrawer', start)
journeys = '''function Journeys() {
  const { journeys, loading, error } = useTravelRequests();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All journeys");
  const [selected, setSelected] = useState<Journey | null>(null);
  const filtered = useMemo(() => journeys.filter((journey) => (filter === "All journeys" || journey.status === filter) && `${journey.destination} ${journey.project} ${journey.id}`.toLowerCase().includes(query.toLowerCase())), [journeys, query, filter]);
  return <div className="page-stack animate-page"><PageTitle meta={pageMeta["/employee/journeys"]} /><div className="panel table-panel"><div className="table-toolbar"><div className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search journeys" /></div><div className="toolbar-filters"><Filter size={15} /><select value={filter} onChange={(event) => setFilter(event.target.value)}><option>All journeys</option><option>Pending approval</option><option>Approved</option><option>Booked</option><option>Completed</option><option>Cancelled</option></select></div><Link href="/employee/plan-trip" className="button button-primary"><Plus size={16} /> Plan a trip</Link></div>{error && <div className="form-error-message"><XCircle size={15} />{error}</div>}{loading ? <EmptyState icon={<Clock3 size={20} />} title="Loading journeys" description="Fetching your travel activity from Travora." /> : filtered.length ? <div className="responsive-table"><table><thead><tr><th>Journey</th><th>Dates</th><th>Project</th><th>Status</th><th /></tr></thead><tbody>{filtered.map((journey) => <tr key={journey.id} onClick={() => setSelected(journey)}><td><div className="table-journey"><span className="journey-icon"><Plane size={15} /></span><span><strong>{journey.destination}</strong><small>{journey.id} · {journey.from} → {journey.to}</small></span></div></td><td>{journey.dates}</td><td>{journey.project}</td><td><StatusBadge status={journey.status} /></td><td><ChevronRight size={16} className="row-chevron" /></td></tr>)}</tbody></table></div> : <EmptyState icon={<Compass size={20} />} title="No journeys yet" description="Your submitted travel requests will appear here." action={<Link className="button button-primary button-small" href="/employee/plan-trip">Plan a trip</Link>} />}</div>{selected && <JourneyDrawer journey={selected} onClose={() => setSelected(null)} />}</div>;
}'''
text = text[:start] + journeys + text[end:]

path.write_text(text)
