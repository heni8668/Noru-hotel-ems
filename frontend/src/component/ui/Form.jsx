import { cn } from "../../utils";

export function Field({ label, error, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {children}
      {error ? <span className="block text-sm text-red-600">{error}</span> : null}
    </label>
  );
}

const controlClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent/20";

export function TextInput({ className, ...props }) {
  return <input className={cn(controlClass, className)} {...props} />;
}

export function SelectInput({ className, children, ...props }) {
  return (
    <select className={cn(controlClass, className)} {...props}>
      {children}
    </select>
  );
}

export function TextArea({ className, ...props }) {
  return <textarea className={cn(controlClass, "min-h-24", className)} {...props} />;
}

export function StatCard({ title, value, hint, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink-soft">{title}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-ink">{value}</p>
          {hint ? <p className="mt-1 text-sm text-ink-soft">{hint}</p> : null}
        </div>
        <div className="rounded-xl bg-accent/10 p-3 text-accent">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export function Badge({ children, tone = "neutral" }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "neutral" && "bg-slate-100 text-slate-700",
        tone === "success" && "bg-emerald-50 text-emerald-700",
        tone === "warning" && "bg-amber-50 text-amber-700",
        tone === "danger" && "bg-red-50 text-red-700",
        tone === "info" && "bg-sky-50 text-sky-700",
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({ title, body }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
      <p className="text-lg font-bold text-ink">{title}</p>
      <p className="mt-2 text-sm text-ink-soft">{body}</p>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-soft">{subtitle}</p>
      </div>
      {actions}
    </div>
  );
}
