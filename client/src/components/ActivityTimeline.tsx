import { useState, useMemo } from "react";
import {
  FileText,
  CheckCircle2,
  TicketCheck,
  WalletCards,
  Clock,
  Filter,
  Sparkles,
} from "lucide-react";
import type { ActivityEvent, Journey } from "../types";
import type { AuthUser } from "../lib/api";

interface ActivityTimelineProps {
  journeys?: Journey[];
  user?: AuthUser;
}

export function ActivityTimeline({ journeys = [], user }: ActivityTimelineProps) {
  const [filter, setFilter] = useState<string>("ALL");

  // Derive dynamic activity events from the authenticated user's actual journeys
  const events = useMemo<ActivityEvent[]>(() => {
    if (!journeys || journeys.length === 0) return [];

    const list: ActivityEvent[] = [];
    journeys.forEach((journey) => {
      // 1. Request submission event
      list.push({
        id: `act-req-${journey.id}`,
        type: "request",
        actor: journey.passenger || user?.username || "You",
        role: "EMPLOYEE",
        action: "Submitted travel request",
        target: `${journey.destination} (${journey.from} → ${journey.to}) · ${journey.project}`,
        timestamp: journey.dates,
        badgeVariant: "warning",
      });

      // 2. Approver decision event
      if (journey.status === "Approved" || journey.status === "Booked") {
        list.push({
          id: `act-app-${journey.id}`,
          type: "approval",
          actor: journey.approverName || "Management Approver",
          role: "APPROVER",
          action: "Approved travel request",
          target: `${journey.destination} · ${journey.approvalComment || "Authorized for desk ticketing"}`,
          timestamp: journey.approvalDate ? new Date(journey.approvalDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Approved",
          badgeVariant: "info",
        });
      }

      // 3. Desk Booking event
      if (journey.status === "Booked") {
        list.push({
          id: `act-bk-${journey.id}`,
          type: "booking",
          actor: "Travel Desk Operations",
          role: "TRAVEL_DESK",
          action: "Confirmed booking & issued ticket",
          target: `${journey.destination} · Ticket attached to your journey`,
          timestamp: "Confirmed",
          badgeVariant: "success",
        });
      }
    });

    return list;
  }, [journeys, user]);

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

        {events.length > 0 && (
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
        )}
      </div>

      {events.length === 0 ? (
        <div className="p-6 text-center rounded-xl bg-[#f8faf9] dark:bg-[#132225] border border-dashed border-[#d8e2dc] dark:border-[#273d42] space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-[#eef4f1] dark:bg-[#1d3336] flex items-center justify-center text-[#398064]">
            <Sparkles size={18} />
          </div>
          <strong className="block text-sm text-[#182329] dark:text-[#edf5f1]">
            No travel activity yet
          </strong>
          <p className="text-xs text-[#839099] max-w-sm mx-auto">
            Your submitted travel requests, manager approvals, and ticket bookings will appear here in chronological order.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e2e8e5] dark:before:bg-[#284247]">
          {filtered.map((item) => (
            <div key={item.id} className="relative group">
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
                  {item.action}:{" "}
                  <span className="font-medium text-[#182329] dark:text-[#edf5f1]">{item.target}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
