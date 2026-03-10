import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import UserTable from "../components/UserTable";
import UserForm from "../components/UserForm";
import { getUsers, getRoles, createUser, updateUser, deleteUser } from "../user.service";
import { ROUTE } from "../../../../app/routes";

export default function ManageUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [data, roleList] = await Promise.all([getUsers(), getRoles()]);
      setUsers(data);
      setRoles(roleList);
    } catch (err) {
      setError(err?.message ?? "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  const handleSubmit = async (data) => {
    try {
      setSubmitting(true);
      if (editingUser) {
        await updateUser(editingUser.id, { name: data.name, roleId: data.roleId });
      } else {
        await createUser(data);
      }
      setFormOpen(false);
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      alert(err?.message ?? "Operation failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    try {
      await deleteUser(user.id);
      await fetchUsers();
    } catch (err) {
      alert(err?.message ?? "Delete failed.");
    }
  };

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        minHeight: "100vh",
        background: "#f9fafb",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "white",
          padding: "20px 40px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <button
          onClick={() => navigate(ROUTE.ultrauserMenu)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#FF8040",
            fontSize: "20px",
            display: "flex",
            alignItems: "center",
            padding: 0,
          }}
        >
          ←
        </button>
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "800",
              color: "#1a202c",
              margin: "0 0 2px 0",
            }}
          >
            User Management
          </h1>
          <p style={{ color: "#718096", fontSize: "13px", margin: 0 }}>
            View, create, edit, and delete CRM user accounts.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          style={{
            marginLeft: "auto",
            background: "#FF8040",
            color: "white",
            border: "none",
            padding: "10px 24px",
            borderRadius: "8px",
            fontWeight: "700",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          + Add User
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "32px 40px" }}>
        {error && (
          <div
            style={{
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <div
              style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}
            >
              Loading users...
            </div>
          ) : (
            <UserTable
              users={users}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      {/* Modal */}
      {formOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(16,24,40,0.35)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={(e) => e.target === e.currentTarget && setFormOpen(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "32px",
              width: "min(640px, 94vw)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "800",
                color: "#1a202c",
                margin: "0 0 20px 0",
              }}
            >
              {editingUser ? "Edit User" : "Create New User"}
            </h2>
            <UserForm
              initial={editingUser}
              roles={roles}
              onSubmit={handleSubmit}
              onCancel={() => {
                setFormOpen(false);
                setEditingUser(null);
              }}
              loading={submitting}
            />
          </div>
        </div>
      )}
    </div>
  );
}
