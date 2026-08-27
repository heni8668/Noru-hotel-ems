import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { EmployeeFormModal } from "../component/forms/EmployeeFormModal";
import { Button } from "../component/ui/Button";
import { Badge, EmptyState, PageHeader, SelectInput, TextInput } from "../component/ui/Form";
import { ConfirmDialog } from "../component/ui/Modal";
import { fetchDepartments } from "../redux/slices/departmentSlice";
import { createEmployee, deleteEmployee, fetchEmployees, updateEmployee } from "../redux/slices/employeeSlice";
import { fetchRoles } from "../redux/slices/roleSlice";
import { formatDate, fullName, getApiErrorMessage } from "../utils";

export function EmployeesPage() {
  const dispatch = useDispatch();
  const { items: employees, loading, saving } = useSelector((state) => state.employees);
  const departments = useSelector((state) => state.departments.items);
  const roles = useSelector((state) => state.roles.items);

  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [editor, setEditor] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchRoles());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchEmployees({
        search: search || undefined,
        departmentId: departmentId || undefined,
        roleId: roleId || undefined,
      }),
    );
  }, [dispatch, search, departmentId, roleId]);

  const current = editor && editor !== "new" ? editor : null;

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle="Create staff records and assign each person to a department and role."
        actions={<Button onClick={() => setEditor("new")}>Add employee</Button>}
      />

      <div className="mb-4 grid gap-3 rounded-2xl border border-line bg-white p-4 sm:grid-cols-3">
        <TextInput placeholder="Search name or email" value={search} onChange={(event) => setSearch(event.target.value)} />
        <SelectInput value={departmentId} onChange={(event) => setDepartmentId(event.target.value)}>
          <option value="">All departments</option>
          {departments.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </SelectInput>
        <SelectInput value={roleId} onChange={(event) => setRoleId(event.target.value)}>
          <option value="">All roles</option>
          {roles.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </SelectInput>
      </div>

      {loading ? (
        <p className="text-sm text-ink-soft">Loading employees...</p>
      ) : employees.length === 0 ? (
        <EmptyState title="No employees found" body="Add a department and role first, then create your first employee." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-canvas text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-semibold">Employee</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Hired</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">{fullName(employee)}</p>
                    <p className="text-xs text-ink-soft">{employee.email}</p>
                  </td>
                  <td className="px-4 py-3">{employee.department.name}</td>
                  <td className="px-4 py-3">{employee.role.name}</td>
                  <td className="px-4 py-3">{formatDate(employee.hireDate)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={employee.status === "ACTIVE" ? "success" : "neutral"}>{employee.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => setEditor(employee)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setPendingDelete(employee)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <EmployeeFormModal
        open={editor !== null}
        employee={current}
        departments={departments}
        roles={roles}
        submitting={saving}
        onClose={() => setEditor(null)}
        onSubmit={(values) =>
          dispatch(current ? updateEmployee({ id: current.id, ...values }) : createEmployee(values)).unwrap()
        }
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete employee"
        body={`This will also remove shift assignments and attendance for ${pendingDelete ? fullName(pendingDelete) : ""}.`}
        loading={saving}
        onClose={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          try {
            const result = await dispatch(deleteEmployee(pendingDelete.id)).unwrap();
            toast.success(result.message || "Employee deleted.");
            setPendingDelete(null);
          } catch (error) {
            toast.error(getApiErrorMessage(error));
          }
        }}
      />
    </div>
  );
}
