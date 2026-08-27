import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, TextInput } from "../component/ui/Form";
import { fetchAttendanceByDepartment, fetchPunctuality, fetchShiftCoverage } from "../redux/slices/reportSlice";
import { daysAgoIso, todayIso } from "../utils";

export function ReportsPage() {
  const dispatch = useDispatch();
  const { attendanceByDepartment: attendance, coverage, punctuality } = useSelector((state) => state.reports);
  const [from, setFrom] = useState(daysAgoIso(13));
  const [to, setTo] = useState(todayIso());
  const [coverageDate, setCoverageDate] = useState(todayIso());

  useEffect(() => {
    dispatch(fetchAttendanceByDepartment({ from, to }));
    dispatch(fetchPunctuality({ from, to }));
  }, [dispatch, from, to]);

  useEffect(() => {
    dispatch(fetchShiftCoverage({ date: coverageDate }));
  }, [dispatch, coverageDate]);

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Department attendance quality, shift coverage, and staff punctuality — including the non-trivial SQL report."
      />

      <section className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">Attendance by department</h2>
            <p className="text-sm text-ink-soft">
              Expected days, presence mix, punctuality, and average hours worked across the selected range.
            </p>
          </div>
          <div className="grid w-full grid-cols-1 gap-3 sm:max-w-sm sm:grid-cols-2">
            <TextInput type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
            <TextInput type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </div>
        </div>
        <div className="h-56 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendance} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dce5eb" />
              <XAxis dataKey="departmentName" tick={{ fontSize: 11 }} interval={0} />
              <YAxis tick={{ fontSize: 11 }} width={32} />
              <Tooltip />
              <Legend />
              <Bar dataKey="presentCount" fill="#0f766e" name="Present" />
              <Bar dataKey="lateCount" fill="#b8860b" name="Late" />
              <Bar dataKey="absentCount" fill="#dc2626" name="Absent" />
              <Bar dataKey="leaveCount" fill="#0284c7" name="Leave" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-3 md:hidden">
          {attendance.map((row) => (
            <article key={row.departmentId} className="rounded-xl bg-canvas p-3">
              <p className="font-semibold text-ink">{row.departmentName}</p>
              <p className="mt-1 text-sm text-ink-soft">
                Staff {row.employeeCount} · Attendance {row.attendanceRate}% · Punctuality {row.punctualityRate}% · Avg {row.averageHoursWorked}h
              </p>
            </article>
          ))}
        </div>
        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="text-ink-soft">
              <tr>
                <th className="px-3 py-2 font-semibold">Department</th>
                <th className="px-3 py-2 font-semibold">Staff</th>
                <th className="px-3 py-2 font-semibold">Attendance %</th>
                <th className="px-3 py-2 font-semibold">Punctuality %</th>
                <th className="px-3 py-2 font-semibold">Avg hours</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((row) => (
                <tr key={row.departmentId} className="border-t border-line">
                  <td className="px-3 py-2 font-semibold">{row.departmentName}</td>
                  <td className="px-3 py-2">{row.employeeCount}</td>
                  <td className="px-3 py-2">{row.attendanceRate}%</td>
                  <td className="px-3 py-2">{row.punctualityRate}%</td>
                  <td className="px-3 py-2">{row.averageHoursWorked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">Shift coverage</h2>
            <p className="text-sm text-ink-soft">How many active employees in each department are rostered for each shift.</p>
          </div>
          <TextInput className="w-full sm:max-w-52" type="date" value={coverageDate} onChange={(event) => setCoverageDate(event.target.value)} />
        </div>
        <div className="space-y-3 md:hidden">
          {coverage.map((row) => (
            <article key={`${row.departmentId}-${row.shiftId}`} className="rounded-xl bg-canvas p-3">
              <p className="font-semibold text-ink">{row.departmentName}</p>
              <p className="mt-1 text-sm text-ink-soft">
                {row.shiftName} ({row.startTime}–{row.endTime})
              </p>
              <p className="mt-1 text-sm font-semibold text-accent">
                {row.coveragePercent}% · {row.assignedCount}/{row.activeEmployeeCount} staff
              </p>
            </article>
          ))}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="text-ink-soft">
              <tr>
                <th className="px-3 py-2 font-semibold">Department</th>
                <th className="px-3 py-2 font-semibold">Shift</th>
                <th className="px-3 py-2 font-semibold">Assigned</th>
                <th className="px-3 py-2 font-semibold">Active staff</th>
                <th className="px-3 py-2 font-semibold">Coverage</th>
              </tr>
            </thead>
            <tbody>
              {coverage.map((row) => (
                <tr key={`${row.departmentId}-${row.shiftId}`} className="border-t border-line">
                  <td className="px-3 py-2">{row.departmentName}</td>
                  <td className="px-3 py-2">
                    {row.shiftName} ({row.startTime}–{row.endTime})
                  </td>
                  <td className="px-3 py-2">{row.assignedCount}</td>
                  <td className="px-3 py-2">{row.activeEmployeeCount}</td>
                  <td className="px-3 py-2 font-semibold">{row.coveragePercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-lg font-bold text-ink">Punctuality by employee</h2>
        <p className="mb-4 text-sm text-ink-soft">Late and absent counts against scheduled and recorded days in the selected range.</p>
        <div className="space-y-3 md:hidden">
          {punctuality.map((row) => (
            <article key={row.employeeId} className="rounded-xl bg-canvas p-3">
              <p className="font-semibold text-ink">{row.fullName}</p>
              <p className="mt-1 text-sm text-ink-soft">{row.departmentName}</p>
              <p className="mt-2 text-sm text-ink-soft">
                Scheduled {row.scheduledDays} · Recorded {row.recordedDays} · Late {row.lateCount} · Absent {row.absentCount}
              </p>
              <p className="mt-1 text-xs text-ink-soft">Avg arrival {row.averageArrivalTime ?? "—"}</p>
            </article>
          ))}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="text-ink-soft">
              <tr>
                <th className="px-3 py-2 font-semibold">Employee</th>
                <th className="px-3 py-2 font-semibold">Department</th>
                <th className="px-3 py-2 font-semibold">Scheduled</th>
                <th className="px-3 py-2 font-semibold">Recorded</th>
                <th className="px-3 py-2 font-semibold">Late</th>
                <th className="px-3 py-2 font-semibold">Absent</th>
                <th className="px-3 py-2 font-semibold">Avg arrival</th>
              </tr>
            </thead>
            <tbody>
              {punctuality.map((row) => (
                <tr key={row.employeeId} className="border-t border-line">
                  <td className="px-3 py-2 font-semibold">{row.fullName}</td>
                  <td className="px-3 py-2">{row.departmentName}</td>
                  <td className="px-3 py-2">{row.scheduledDays}</td>
                  <td className="px-3 py-2">{row.recordedDays}</td>
                  <td className="px-3 py-2">{row.lateCount}</td>
                  <td className="px-3 py-2">{row.absentCount}</td>
                  <td className="px-3 py-2">{row.averageArrivalTime ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
