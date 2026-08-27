import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Building2,
  CalendarClock,
  ClipboardCheck,
  LayoutDashboard,
  LineChart,
  Users,
  Briefcase,
} from "lucide-react";
import { Toaster } from "sonner";
import { cn } from "../../utils";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/departments", label: "Departments", icon: Building2 },
  { to: "/roles", label: "Roles", icon: Briefcase },
  { to: "/shifts", label: "Shifts", icon: CalendarClock },
  { to: "/attendance", label: "Attendance", icon: ClipboardCheck },
  { to: "/reports", label: "Reports", icon: LineChart },
];

export function AppLayout() {
  const location = useLocation();
  const current = links.find((link) => (link.to === "/" ? location.pathname === "/" : location.pathname.startsWith(link.to)));

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="bg-ink text-white">
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent font-extrabold">N</div>
          <div>
            <p className="text-sm font-bold tracking-wide">Noru Hotel EMS</p>
            <p className="text-xs text-white/60">Staff operations</p>
          </div>
        </div>
        <nav className="space-y-1 p-4">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                    isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white",
                  )
                }
              >
                <Icon size={18} />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="border-b border-line bg-white px-4 py-4 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Hotel operations</p>
          <p className="text-lg font-bold text-ink">{current?.label ?? "Noru Hotel EMS"}</p>
        </header>
        <main className="px-4 py-6 sm:px-8">
          <Outlet />
        </main>
      </div>
      <Toaster richColors position="top-right" closeButton />
    </div>
  );
}
