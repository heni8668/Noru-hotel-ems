import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { AttendanceFormModal } from "../component/forms/AttendanceFormModal";
import { Button } from "../component/ui/Button";
import { Badge, EmptyState, PageHeader, SelectInput, TextInput } from "../component/ui/Form";
import { ConfirmDialog } from "../component/ui/Modal";
import { createAttendance, deleteAttendance, fetchAttendance, updateAttendance } from "../redux/slices/attendanceSlice";
import { fetchDepartments } from "../redux/slices/departmentSlice";
import { fetchEmployees } from "../redux/slices/employeeSlice";
import { daysAgoIso, formatDate, formatDateTime, fullName, getApiErrorMessage, todayIso } from "../utils";

const tones = {
  PRESENT: "success",
  LATE: "warning",
  ABSENT: "danger",
  LEAVE: "info",
};

export function AttendancePage() {
  const dispatch = useDispatch();
  const { items, loading, saving } = useSelector((state) => state.attendance);
  const employees = useSelector((state) => state.employees.items);
  const departments = useSelector((state) => state.departments.items);

  const [from, setFrom] = useState(daysAgoIso(6));
  const [to, setTo] = useState(todayIso());
  const [departmentId, setDepartmentId] = useState("");
  const [status, setStatus] = useState("");
  const [editor, setEditor] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const current = editor && editor !== "new" ? editor : null;

  useEffect(() => {
    dispatch(fetchEmployees({}));
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchAttendance({
        from,
        to,
        departmentId: departmentId || undefined,
        status: status || undefined,
      }),
    );
  }, [dispatch, from, to, departmentId, status]);

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Record daily presence, lateness, absence, and leave for hotel staff."
        actions={<Button onClick={() => setEditor("new")}>Record attendance</Button>}
      />

      <div className="mb-4 grid gap-3 rounded-2xl border border-line bg-white p-4 md:grid-cols-4">
        <TextInput type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        <TextInput type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        <SelectInput value={departmentId} onChange={(event) => setDepartmentId(event.target.value)}>
          <option value="">All departments</option>
          {departments.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </SelectInput>
        <SelectInput value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          <option value="PRESENT">Present</option>
          <option value="LATE">Late</option>
          <option value="ABSENT">Absent</option>
          <option value="LEAVE">Leave</option>
        </SelectInput>
      </div>

      {loading ? (
        <p className="text-sm text-ink-soft">Loading attendance...</p>
      ) : items.length === 0 ? (
        <EmptyState title="No attendance records" body="Record check-in and check-out for an employee to get started." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-canvas text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Employee</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Check in</th>
                <th className="px-4 py-3 font-semibold">Check out</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-line">
                  <td className="px-4 py-3">{formatDate(item.date)}</td>
                  <td className="px-4 py-3 font-semibold">{fullName(item.employee)}</td>
                  <td className="px-4 py-3">{item.employee.department.name}</td>
                  <td className="px-4 py-3">
                    <Badge tone={tones[item.status]}>{item.status}</Badge>
                  </td>
                  <td className="px-4 py-3">{formatDateTime(item.checkIn)}</td>
                  <td className="px-4 py-3">{formatDateTime(item.checkOut)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => setEditor(item)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setPendingDelete(item)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AttendanceFormModal
        open={editor !== null}
        record={current}
        employees={employees}
        submitting={saving}
        onClose={() => setEditor(null)}
        onSubmit={(values) =>
          dispatch(
            current
              ? updateAttendance({ id: current.id, status: values.status, checkIn: values.checkIn, checkOut: values.checkOut, notes: values.notes })
              : createAttendance(values),
          ).unwrap()
        }
      />
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete attendance"
        body="This attendance record will be permanently removed."
        loading={saving}
        onClose={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          try {
            const result = await dispatch(deleteAttendance(pendingDelete.id)).unwrap();
            toast.success(result.message || "Attendance deleted.");
            setPendingDelete(null);
          } catch (error) {
            toast.error(getApiErrorMessage(error));
          }
        }}
      />
    </div>
  );
}
