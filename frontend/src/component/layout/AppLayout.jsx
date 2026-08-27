import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Building2,
  CalendarClock,
  ClipboardCheck,
  LayoutDashboard,
  LineChart,
  Users,
  Briefcase,
  Menu,
  X,
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

const COLLAPSE_KEY = "noru-sidebar-collapsed";

export function AppLayout() {
  const location = useLocation();
  const current = links.find((link) => (link.to === "/" ? location.pathname === "/" : location.pathname.startsWith(link.to)));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, String(collapsed));
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-canvas">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-ink/50 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(18rem,86vw)] flex-col bg-ink text-white transition-transform duration-200 ease-out",
          "lg:static lg:z-auto lg:min-h-screen lg:shrink-0 lg:transition-[width] lg:duration-200",
          mobileOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full",
          !mobileOpen && "max-lg:pointer-events-none",
          collapsed ? "lg:w-[4.5rem]" : "lg:w-[260px]",
        )}
      >
        <div
          className={cn(
            "flex items-center border-b border-white/10 px-3 py-3",
            collapsed ? "lg:flex-col lg:gap-2 lg:px-2" : "h-16 gap-2",
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent font-extrabold">N</div>
          <div className={cn("min-w-0 flex-1", collapsed && "lg:hidden")}>
            <p className="truncate text-sm font-bold tracking-wide">Noru Hotel EMS</p>
            <p className="text-xs text-white/60">Staff operations</p>
          </div>
          <button
            type="button"
            className="ml-auto shrink-0 rounded-lg p-2 text-white hover:bg-white/10 lg:ml-0"
            onClick={() => {
              if (window.innerWidth < 1024) setMobileOpen(false);
              else setCollapsed((value) => !value);
            }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <X size={20} className="lg:hidden" />
            <Menu size={20} className="hidden lg:block" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-2 lg:p-3">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                title={link.label}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                    collapsed && "lg:justify-center lg:px-0",
                    isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white",
                  )
                }
              >
                <Icon size={18} className="shrink-0" />
                <span className={cn("truncate", collapsed && "lg:hidden")}>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-line bg-white/95 px-3 py-3 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex rounded-lg p-2 text-ink hover:bg-canvas lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open sidebar"
              aria-expanded={mobileOpen}
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold sm:text-xs">Hotel operations</p>
              <p className="truncate text-base font-bold text-ink sm:text-lg">{current?.label ?? "Noru Hotel EMS"}</p>
            </div>
          </div>
        </header>
        <main className="min-w-0 flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      <Toaster richColors position="top-center" closeButton />
    </div>
  );
}
