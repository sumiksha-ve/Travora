import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useLocation } from "wouter";
import {
  BarChart3,
  CalendarDays,
  Compass,
  FileCheck2,
  FileText,
  LogOut,
  Moon,
  Plus,
  Search,
  Settings2,
  Sun,
  TicketCheck,
  UserRound,
  WalletCards,
  X,
  Sparkles,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import type { AuthUser, Role } from "../lib/api";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AuthUser;
  onLogout: () => void;
}

export function CommandPalette({ open, onOpenChange, user, onLogout }: CommandPaletteProps) {
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const role: Role = user.role;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      } else if (e.key === "Escape" && open) {
        e.preventDefault();
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const navigate = (path: string) => {
    setLocation(path);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#1a2c30] rounded-2xl shadow-2xl border border-[#e2e8e5] dark:border-[#2b444a] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Travora Command Palette" className="w-full">
          <div className="flex items-center px-4 border-b border-[#e2e8e5] dark:border-[#2b444a] gap-3">
            <Search size={18} className="text-[#839099] shrink-0" />
            <Command.Input
              autoFocus
              placeholder="Type a command or search actions… (Esc to close)"
              className="w-full py-4 bg-transparent outline-none text-[15px] text-[#182329] dark:text-[#edf5f1] placeholder:text-[#839099]"
            />
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="p-1 rounded-lg text-[#839099] hover:text-[#182329] dark:hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <Command.List className="max-h-[360px] overflow-y-auto p-2 space-y-1">
            <Command.Empty className="py-8 text-center text-sm text-[#839099]">
              No matching actions or pages found.
            </Command.Empty>

            {/* Quick Actions */}
            <Command.Group
              heading="Quick Actions"
              className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#e7a947]"
            >
              <Command.Item
                onSelect={() => {
                  toggleTheme();
                  onOpenChange(false);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm text-[#182329] dark:text-[#dbe7e4] hover:bg-[#f1f6f3] dark:hover:bg-[#243b40] transition-colors"
              >
                {theme === "light" ? <Moon size={16} className="text-[#e7a947]" /> : <Sun size={16} className="text-[#e7a947]" />}
                <span>Toggle theme ({theme === "light" ? "Dark mode" : "Light mode"})</span>
                <span className="ml-auto text-xs text-[#839099]">Cmd+Shift+T</span>
              </Command.Item>

              {role === "EMPLOYEE" && (
                <>
                  <Command.Item
                    onSelect={() => navigate("/employee/plan-trip")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm text-[#182329] dark:text-[#dbe7e4] hover:bg-[#f1f6f3] dark:hover:bg-[#243b40] transition-colors"
                  >
                    <Plus size={16} className="text-[#398064]" />
                    <span>Plan a new travel request</span>
                    <span className="ml-auto text-xs text-[#839099]">New request</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => navigate("/employee/expenses")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm text-[#182329] dark:text-[#dbe7e4] hover:bg-[#f1f6f3] dark:hover:bg-[#243b40] transition-colors"
                  >
                    <WalletCards size={16} className="text-[#e7a947]" />
                    <span>Log travel expense / claim</span>
                    <span className="ml-auto text-xs text-[#839099]">Receipts</span>
                  </Command.Item>
                </>
              )}
            </Command.Group>

            {/* Navigation by Role */}
            <Command.Group
              heading="Workspace Navigation"
              className="px-2 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#839099]"
            >
              {role === "EMPLOYEE" && (
                <>
                  <Command.Item
                    onSelect={() => navigate("/employee")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm text-[#182329] dark:text-[#dbe7e4] hover:bg-[#f1f6f3] dark:hover:bg-[#243b40] transition-colors"
                  >
                    <Sparkles size={16} />
                    <span>Employee Dashboard Overview</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => navigate("/employee/journeys")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm text-[#182329] dark:text-[#dbe7e4] hover:bg-[#f1f6f3] dark:hover:bg-[#243b40] transition-colors"
                  >
                    <Compass size={16} />
                    <span>My Journeys</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => navigate("/employee/calendar")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm text-[#182329] dark:text-[#dbe7e4] hover:bg-[#f1f6f3] dark:hover:bg-[#243b40] transition-colors"
                  >
                    <CalendarDays size={16} />
                    <span>Travel Calendar Schedule</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => navigate("/employee/expenses")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm text-[#182329] dark:text-[#dbe7e4] hover:bg-[#f1f6f3] dark:hover:bg-[#243b40] transition-colors"
                  >
                    <WalletCards size={16} />
                    <span>Expense Tracker & Receipts</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => navigate("/employee/profile")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm text-[#182329] dark:text-[#dbe7e4] hover:bg-[#f1f6f3] dark:hover:bg-[#243b40] transition-colors"
                  >
                    <UserRound size={16} />
                    <span>Travel Profile & Preferences</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => navigate("/employee/reports")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm text-[#182329] dark:text-[#dbe7e4] hover:bg-[#f1f6f3] dark:hover:bg-[#243b40] transition-colors"
                  >
                    <BarChart3 size={16} />
                    <span>Travel Reports & Destination Insights</span>
                  </Command.Item>
                </>
              )}

              {role === "APPROVER" && (
                <>
                  <Command.Item
                    onSelect={() => navigate("/approver")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm text-[#182329] dark:text-[#dbe7e4] hover:bg-[#f1f6f3] dark:hover:bg-[#243b40] transition-colors"
                  >
                    <FileCheck2 size={16} />
                    <span>Approval Queue</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => navigate("/approver/history")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm text-[#182329] dark:text-[#dbe7e4] hover:bg-[#f1f6f3] dark:hover:bg-[#243b40] transition-colors"
                  >
                    <FileText size={16} />
                    <span>Approval Decision History</span>
                  </Command.Item>
                </>
              )}

              {role === "TRAVEL_DESK" && (
                <>
                  <Command.Item
                    onSelect={() => navigate("/travel-desk")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm text-[#182329] dark:text-[#dbe7e4] hover:bg-[#f1f6f3] dark:hover:bg-[#243b40] transition-colors"
                  >
                    <TicketCheck size={16} />
                    <span>Operations Overview</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => navigate("/travel-desk/bookings")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm text-[#182329] dark:text-[#dbe7e4] hover:bg-[#f1f6f3] dark:hover:bg-[#243b40] transition-colors"
                  >
                    <TicketCheck size={16} />
                    <span>Booking Queue</span>
                  </Command.Item>
                </>
              )}

              {role === "ADMIN" && (
                <>
                  <Command.Item
                    onSelect={() => navigate("/admin")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm text-[#182329] dark:text-[#dbe7e4] hover:bg-[#f1f6f3] dark:hover:bg-[#243b40] transition-colors"
                  >
                    <Settings2 size={16} />
                    <span>Admin Control Center</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => navigate("/admin/requests")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm text-[#182329] dark:text-[#dbe7e4] hover:bg-[#f1f6f3] dark:hover:bg-[#243b40] transition-colors"
                  >
                    <FileText size={16} />
                    <span>All Travel Requests</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => navigate("/admin/bookings")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm text-[#182329] dark:text-[#dbe7e4] hover:bg-[#f1f6f3] dark:hover:bg-[#243b40] transition-colors"
                  >
                    <TicketCheck size={16} />
                    <span>All Bookings & Spend</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => navigate("/admin/reports")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm text-[#182329] dark:text-[#dbe7e4] hover:bg-[#f1f6f3] dark:hover:bg-[#243b40] transition-colors"
                  >
                    <BarChart3 size={16} />
                    <span>Organization Analytics</span>
                  </Command.Item>
                </>
              )}
            </Command.Group>

            {/* Account */}
            <Command.Group
              heading="Session"
              className="px-2 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#839099]"
            >
              <Command.Item
                onSelect={() => {
                  onOpenChange(false);
                  onLogout();
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm text-[#b15b53] hover:bg-[#b15b53]/10 transition-colors"
              >
                <LogOut size={16} />
                <span>Sign out of Travora</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#e2e8e5] dark:border-[#2b444a] text-xs text-[#839099] bg-[#f7faf8] dark:bg-[#152528]">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-[#e2e8e5] dark:bg-[#243b40] text-[10px] font-mono">↑↓</span>
              <span>Navigate</span>
              <span className="px-1.5 py-0.5 rounded bg-[#e2e8e5] dark:bg-[#243b40] text-[10px] font-mono">↵</span>
              <span>Select</span>
              <span className="px-1.5 py-0.5 rounded bg-[#e2e8e5] dark:bg-[#243b40] text-[10px] font-mono">esc</span>
              <span>Close</span>
            </div>
            <span>Travora Quick Assist</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
