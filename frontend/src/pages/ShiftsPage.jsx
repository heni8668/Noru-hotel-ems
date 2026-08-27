import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { AssignmentFormModal } from "../component/forms/AssignmentFormModal";
import { ShiftFormModal } from "../component/forms/ShiftFormModal";
import { Button } from "../component/ui/Button";
import { EmptyState, PageHeader, SelectInput, TextInput } from "../component/ui/Form";
import { ConfirmDialog } from "../component/ui/Modal";
import { fetchEmployees } from "../redux/slices/employeeSlice";
import {
  assignShift,
  createShift,
  deleteShift,
  fetchAssignments,
  fetchShifts,
  unassignShift,
  updateShift,
} from "../redux/slices/shiftSlice";
import { daysAgoIso, formatDate, fullName, getApiErrorMessage, todayIso } from "../utils";

export function ShiftsPage() {
  const dispatch = useDispatch();
  const { items: shifts, assignments, loading, saving } = useSelector((state) => state.shifts);
  const employees = useSelector((state) => state.employees.items);

  const [from, setFrom] = useState(daysAgoIso(6));
  const [to, setTo] = useState(todayIso());
  const [shiftId, setShiftId] = useState("");
  const [shiftEditor, setShiftEditor] = useState(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [pendingShift, setPendingShift] = useState(null);
  const [pendingAssignment, setPendingAssignment] = useState(null);
  const currentShift = shiftEditor && shiftEditor !== "new" ? shiftEditor : null;

  useEffect(() => {
    dispatch(fetchShifts());
    dispatch(fetchEmployees({}));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAssignments({ from, to, shiftId: shiftId || undefined }));
  }, [dispatch, from, to, shiftId]);

  return (
    <div>
      <PageHeader
        title="Shifts"
        subtitle="Define hotel shift templates, then assign employees to a shift on a given date."
        actions={
          <>
            <Button variant="secondary" onClick={() => setShiftEditor("new")}>
              Add shift type
            </Button>
            <Button onClick={() => setAssignOpen(true)}>Assign shift</Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shifts.map((shift) => (
          <article key={shift.id} className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <h2 className="font-bold text-ink">{shift.name}</h2>
            <p className="mt-1 text-sm text-accent">
              {shift.startTime} – {shift.endTime}
            </p>
            <p className="mt-2 text-sm text-ink-soft">{shift.description || "No description"}</p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setShiftEditor(shift)}>
                Edit
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setPendingShift(shift)}>
                Delete
              </Button>
            </div>
          </article>
        ))}
      </div>

      <div className="mb-4 grid gap-3 rounded-2xl border border-line bg-white p-4 md:grid-cols-3">
        <TextInput type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        <TextInput type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        <SelectInput value={shiftId} onChange={(event) => setShiftId(event.target.value)}>
          <option value="">All shift types</option>
          {shifts.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </SelectInput>
      </div>

      {loading ? (
        <p className="text-sm text-ink-soft">Loading assignments...</p>
      ) : assignments.length === 0 ? (
        <EmptyState title="No shift assignments" body="Assign employees to a shift to build the coverage roster." />
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {assignments.map((item) => (
              <article key={item.id} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
                <p className="font-semibold text-ink">{fullName(item.employee)}</p>
                <p className="mt-1 text-sm text-ink-soft">{item.employee.department.name}</p>
                <p className="mt-2 text-sm text-accent">
                  {item.shift.name} ({item.shift.startTime}–{item.shift.endTime})
                </p>
                <p className="mt-1 text-xs text-ink-soft">{formatDate(item.date)}</p>
                <div className="mt-3">
                  <Button size="sm" variant="ghost" onClick={() => setPendingAssignment(item)}>
                    Remove
                  </Button>
                </div>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto rounded-2xl border border-line bg-white shadow-sm md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-canvas text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Employee</th>
                  <th className="hidden px-4 py-3 font-semibold lg:table-cell">Department</th>
                  <th className="px-4 py-3 font-semibold">Shift</th>
                  <th className="px-4 py-3 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {assignments.map((item) => (
                  <tr key={item.id} className="border-t border-line">
                    <td className="px-4 py-3">{formatDate(item.date)}</td>
                    <td className="px-4 py-3 font-semibold">{fullName(item.employee)}</td>
                    <td className="hidden px-4 py-3 lg:table-cell">{item.employee.department.name}</td>
                    <td className="px-4 py-3">
                      {item.shift.name} ({item.shift.startTime}–{item.shift.endTime})
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => setPendingAssignment(item)}>
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ShiftFormModal
        open={shiftEditor !== null}
        shift={currentShift}
        submitting={saving}
        onClose={() => setShiftEditor(null)}
        onSubmit={(values) => dispatch(currentShift ? updateShift({ id: currentShift.id, ...values }) : createShift(values)).unwrap()}
      />
      <AssignmentFormModal
        open={assignOpen}
        employees={employees}
        shifts={shifts}
        submitting={saving}
        onClose={() => setAssignOpen(false)}
        onSubmit={(values) => dispatch(assignShift(values)).unwrap()}
      />
      <ConfirmDialog
        open={Boolean(pendingShift)}
        title="Delete shift type"
        body="Shift types with existing assignments cannot be deleted."
        loading={saving}
        onClose={() => setPendingShift(null)}
        onConfirm={async () => {
          if (!pendingShift) return;
          try {
            const result = await dispatch(deleteShift(pendingShift.id)).unwrap();
            toast.success(result.message || "Shift deleted.");
            setPendingShift(null);
          } catch (error) {
            toast.error(getApiErrorMessage(error));
          }
        }}
      />
      <ConfirmDialog
        open={Boolean(pendingAssignment)}
        title="Remove assignment"
        body="This employee will no longer be rostered for that date."
        confirmLabel="Remove"
        loading={saving}
        onClose={() => setPendingAssignment(null)}
        onConfirm={async () => {
          if (!pendingAssignment) return;
          try {
            const result = await dispatch(unassignShift(pendingAssignment.id)).unwrap();
            toast.success(result.message || "Assignment removed.");
            setPendingAssignment(null);
          } catch (error) {
            toast.error(getApiErrorMessage(error));
          }
        }}
      />
    </div>
  );
}
