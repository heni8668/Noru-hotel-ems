import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { NamedEntityFormModal } from "../component/forms/NamedEntityFormModal";
import { Button } from "../component/ui/Button";
import { EmptyState, PageHeader } from "../component/ui/Form";
import { ConfirmDialog } from "../component/ui/Modal";
import { createDepartment, deleteDepartment, fetchDepartments, updateDepartment } from "../redux/slices/departmentSlice";
import { getApiErrorMessage } from "../utils";

export function DepartmentsPage() {
  const dispatch = useDispatch();
  const { items, loading, saving } = useSelector((state) => state.departments);
  const [editor, setEditor] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const current = editor && editor !== "new" ? editor : null;

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle="Hotel units that employees are assigned to, such as Front Office or Housekeeping."
        actions={<Button onClick={() => setEditor("new")}>Add department</Button>}
      />
      {loading ? (
        <p className="text-sm text-ink-soft">Loading departments...</p>
      ) : items.length === 0 ? (
        <EmptyState title="No departments yet" body="Create the hotel departments before adding employees." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-line bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-ink">{item.name}</h2>
              <p className="mt-2 min-h-12 text-sm text-ink-soft">{item.description || "No description"}</p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setEditor(item)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setPendingDelete(item)}>
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <NamedEntityFormModal
        open={editor !== null}
        title={current ? "Edit department" : "Add department"}
        initial={current ? { name: current.name, description: current.description ?? "" } : undefined}
        submitting={saving}
        onClose={() => setEditor(null)}
        onSubmit={(values) => dispatch(current ? updateDepartment({ id: current.id, ...values }) : createDepartment(values)).unwrap()}
      />
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete department"
        body="Departments with assigned employees cannot be deleted."
        loading={saving}
        onClose={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          try {
            const result = await dispatch(deleteDepartment(pendingDelete.id)).unwrap();
            toast.success(result.message || "Department deleted.");
            setPendingDelete(null);
          } catch (error) {
            toast.error(getApiErrorMessage(error));
          }
        }}
      />
    </div>
  );
}
