import { useState } from "react";
import {
  FileText,
  CheckCircle2,
  TicketCheck,
  WalletCards,
  Clock,
  ArrowRight,
  Filter,
} from "lucide-react";
import type { ActivityEvent } from "../types";

const INITIAL_EVENTS: ActivityEvent[] = [
  {
    id: "ACT-01",
    type: "booking",
    actor: "Travel Desk Operations",
    role: "TRAVEL_DESK",
    action: "Issued confirmed e-ticket (AI-9821)",
    target: "Bengaluru Tech Hub · AI Flight 802",
    timestamp: "18 minutes ago",
    badgeVariant: "success",
  },
  {
    id: "ACT-02",
    type: "approval",
    actor: "Rajesh Menon",
    role: "APPROVER",
    action: "Approved travel request #REQ-2041",
    target: "Mumbai Financial District · APAC Summit",
    timestamp: "2 hours ago",
    badgeVariant: "info",
  },
  {
    id: "ACT-03",
    type: "expense",
    actor: "Finance Accounts",
    role: "SYSTEM",
    action: "Reimbursed meal claim (₹1,850)",
    target: "Trishna Restaurant · Mumbai Trip",
    timestamp: "5 hours ago",
    badgeVariant: "success",
  },
  {
    id: "ACT-04",
    type: "request",
    actor: "Vikram Mehta",
    role: "EMPLOYEE",
    action: "Submitted new travel request",
    target: "Singapore Regional HQ · Q4 Review",
    timestamp: "Yesterday, 4:15 PM",
    badgeVariant: "warning",
  },
  {
    id: "ACT-05",
    type: "system",
    actor: "Travora Duty of Care",
    role: "SYSTEM",
    action: "Verified medical emergency cover",
    target: "All active travelers in Southeast Asia",
    timestamp: "2 days ago",
    badgeVariant: "neutral",
  },
];

export function ActivityTimeline() {
  const [events] = useState<ActivityEvent[]>(INITIAL_EVENTS);
  const [filter, setFilter] = useState<string>("ALL");

  const filtered = events.filter((e) => filter === "ALL" || e.type === filter);

  const getIcon = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "booking":
        return <TicketCheck size={16} className="text-[#398064]" />;
      case "approval":
        return <CheckCircle2 size={16} className="text-[#547b91]" />;
      case "expense":
        return <WalletCards size={16} className="text-[#e7a947]" />;
      case "request":
        return <FileText size={16} className="text-[#e7a947]" />;
      default:
        return <Clock size={16} className="text-[#839099]" />;
    }
  };

  return (
    <div className="panel p-6 rounded-2xl bg-white dark:bg-[#1a2c30] border border-[#e2e8e5] dark:border-[#2b444a] shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="card-kicker">AUDIT & EVENT STREAM</span>
          <h2 className="section-heading">Activity Feed</h2>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <Filter size={13} className="text-[#839099]" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs bg-transparent border border-[#e2e8e5] dark:border-[#2b444a] rounded-lg px-2 py-1 text-[#52616a] dark:text-[#9bb0ac]"
          >
            <option value="ALL">All activities</option>
            <option value="booking">Bookings</option>
            <option value="approval">Approvals</option>
            <option value="expense">Expenses</option>
            <option value="request">Requests</option>
          </select>
        </div>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e2e8e5] dark:before:bg-[#284247]">
        {filtered.map((item) => (
          <div key={item.id} className="relative group">
            {/* Dot marker */}
            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white dark:bg-[#1a2c30] border-2 border-[#e2e8e5] dark:border-[#2b444a] flex items-center justify-center group-hover:border-[#398064] transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-[#398064]" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {getIcon(item.type)}
                  <strong className="text-[#182329] dark:text-[#edf5f1] font-semibold">
                    {item.actor}
                  </strong>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#f1f6f3] dark:bg-[#203638] text-[#52616a] dark:text-[#9bb0ac]">
                    {item.role}
                  </span>
                </div>
                <span className="text-[11px] text-[#839099] flex items-center gap-1">
                  <Clock size={11} /> {item.timestamp}
                </span>
              </div>

              <p className="text-xs text-[#52616a] dark:text-[#9bb0ac]">
                {item.action}: <span className="font-medium text-[#182329] dark:text-[#edf5f1]">{item.target}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
