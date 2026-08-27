import { CalendarClock, ClipboardCheck, Users, Building2 } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EmptyState, PageHeader, StatCard } from "../component/ui/Form";
import { fetchEmployees } from "../redux/slices/employeeSlice";
import { fetchAttendanceByDepartment, fetchDashboard } from "../redux/slices/reportSlice";
import { daysAgoIso, todayIso } from "../utils";

export function DashboardPage() {
  const dispatch = useDispatch();
  const { dashboard: stats, attendanceByDepartment: attendance, loading, error } = useSelector((state) => state.reports);
  const employees = useSelector((state) => state.employees.items);

  useEffect(() => {
    dispatch(fetchDashboard());
    dispatch(fetchAttendanceByDepartment({ from: daysAgoIso(13), to: todayIso() }));
    dispatch(fetchEmployees({ status: "ACTIVE" }));
  }, [dispatch]);

  if (error) {
    return <EmptyState title="Could not load dashboard" body="Start the API and PostgreSQL, then refresh this page." />;
  }

  const presentRate = stats && stats.todayExpected > 0 ? Math.round((stats.todayPresent / stats.todayExpected) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="Operations snapshot"
        subtitle="A concise view of staffing, today's attendance, and department performance for the last 14 days."
        actions={
          <Link to="/reports" className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark">
            Open reports
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Employees" value={loading && !stats ? "—" : stats?.employeeCount ?? 0} hint={`${stats?.activeEmployeeCount ?? 0} active`} icon={Users} />
        <StatCard title="Departments" value={loading && !stats ? "—" : stats?.departmentCount ?? 0} hint="Hotel operating units" icon={Building2} />
        <StatCard title="Today present" value={loading && !stats ? "—" : `${presentRate}%`} hint={`${stats?.todayPresent ?? 0} of ${stats?.todayExpected ?? 0} expected`} icon={ClipboardCheck} />
        <StatCard title="Shifts today" value={loading && !stats ? "—" : stats?.todayAssignedShifts ?? 0} hint="Assigned coverage" icon={CalendarClock} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-base font-bold text-ink">Attendance rate by department</h2>
          <p className="mb-4 text-sm text-ink-soft">Present + late against expected working days, last 14 days.</p>
          <div className="h-56 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendance} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dce5eb" />
                <XAxis dataKey="departmentName" tick={{ fontSize: 11 }} interval={0} />
                <YAxis tick={{ fontSize: 11 }} width={36} />
                <Tooltip />
                <Bar dataKey="attendanceRate" fill="#0f766e" radius={[6, 6, 0, 0]} name="Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-base font-bold text-ink">Recent staff</h2>
          <div className="mt-4 space-y-3">
            {employees.slice(0, 6).map((employee) => (
              <div key={employee.id} className="flex items-center justify-between gap-3 rounded-xl bg-canvas px-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">
                    {employee.firstName} {employee.lastName}
                  </p>
                  <p className="truncate text-xs text-ink-soft">
                    {employee.role.name} · {employee.department.name}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-accent">{employee.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
