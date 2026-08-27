import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { NamedEntityFormModal } from "../component/forms/NamedEntityFormModal";
import { Button } from "../component/ui/Button";
import { EmptyState, PageHeader } from "../component/ui/Form";
import { ConfirmDialog } from "../component/ui/Modal";
import { createRole, deleteRole, fetchRoles, updateRole } from "../redux/slices/roleSlice";
import { getApiErrorMessage } from "../utils";

export function RolesPage() {
  const dispatch = useDispatch();
  const { items, loading, saving } = useSelector((state) => state.roles);
  const [editor, setEditor] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const current = editor && editor !== "new" ? editor : null;

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  return (
    <div>
      <PageHeader
        title="Roles"
        subtitle="Job roles assigned to employees, such as Front Desk Agent or Room Attendant."
        actions={<Button onClick={() => setEditor("new")}>Add role</Button>}
      />
      {loading ? (
        <p className="text-sm text-ink-soft">Loading roles...</p>
      ) : items.length === 0 ? (
        <EmptyState title="No roles yet" body="Create roles before assigning them to employees." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-lg font-bold text-ink">{item.name}</h2>
              <p className="mt-2 min-h-12 text-sm text-ink-soft">{item.description || "No description"}</p>
              <div className="mt-4 flex flex-wrap gap-2">
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
        title={current ? "Edit role" : "Add role"}
        initial={current ? { name: current.name, description: current.description ?? "" } : undefined}
        submitting={saving}
        onClose={() => setEditor(null)}
        onSubmit={(values) => dispatch(current ? updateRole({ id: current.id, ...values }) : createRole(values)).unwrap()}
      />
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete role"
        body="Roles still assigned to employees cannot be deleted."
        loading={saving}
        onClose={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          try {
            const result = await dispatch(deleteRole(pendingDelete.id)).unwrap();
            toast.success(result.message || "Role deleted.");
            setPendingDelete(null);
          } catch (error) {
            toast.error(getApiErrorMessage(error));
          }
        }}
      />
    </div>
  );
}
