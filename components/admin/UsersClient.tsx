'use client';

import { useState } from 'react';
import { Plus, Trash, Warning } from '@/components/icons';

/*
 * Users dashboard (CMS_ROADMAP PR #7). Lists every dashboard user,
 * lets admins flip role and delete. New-user creation lives in an
 * inline form rather than a modal — keeps focus management trivial
 * and mirrors the rest of the admin chrome.
 *
 * All mutation paths show optimistic UI; failures revert and surface
 * a banner with the server's error message.
 */

export interface UserRow {
  id: number;
  email: string;
  name: string | null;
  role: string;
  lastLogin: string | null;
  createdAt: string;
}

interface UsersClientProps {
  initialRows: UserRow[];
  /** Numeric id of the signed-in admin, if known. Used to disable
   * destructive actions on their own row. */
  callerId: number | null;
}

const ROLES = ['admin', 'editor'] as const;
type Role = (typeof ROLES)[number];

export default function UsersClient({ initialRows, callerId }: UsersClientProps) {
  const [rows, setRows] = useState<UserRow[]>(initialRows);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  // Inline create form
  const [showCreate, setShowCreate] = useState(false);
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createName, setCreateName] = useState('');
  const [createRole, setCreateRole] = useState<Role>('editor');
  const [creating, setCreating] = useState(false);

  async function updateRole(id: number, role: Role) {
    setBusyId(id);
    setErrorMsg(null);
    const previous = rows;
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, role } : r)));
    try {
      const res = await fetch(`/api/cms/users/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
    } catch (e) {
      setRows(previous);
      setErrorMsg(`Role update failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete(id: number) {
    setPendingDeleteId(null);
    setBusyId(id);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/cms/users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      setRows((rs) => rs.filter((r) => r.id !== id));
    } catch (e) {
      setErrorMsg(`Delete failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusyId(null);
    }
  }

  async function createUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/cms/users', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: createEmail,
          password: createPassword,
          name: createName || null,
          role: createRole,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const created = await res.json();
      setRows((rs) => [
        ...rs,
        {
          id: created.id,
          email: created.email,
          name: created.name ?? null,
          role: created.role,
          lastLogin: null,
          createdAt: created.createdAt,
        },
      ]);
      setCreateEmail('');
      setCreatePassword('');
      setCreateName('');
      setCreateRole('editor');
      setShowCreate(false);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <header className="adm-page-header adm-page-header-row">
        <div>
          <h1>Users</h1>
          <p className="adm-page-sub">
            {rows.length.toLocaleString()} dashboard users · share the password out-of-band.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setShowCreate((v) => !v)}
          aria-expanded={showCreate}
          aria-controls="adm-create-user"
        >
          <Plus size="1em" aria-hidden="true" /> {showCreate ? 'Cancel' : 'New user'}
        </button>
      </header>

      {showCreate ? (
        <form
          id="adm-create-user"
          className="adm-create-form"
          onSubmit={createUser}
        >
          <div className="adm-create-grid">
            <label>
              Email
              <input
                type="email"
                required
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                autoComplete="off"
              />
            </label>
            <label>
              Name <span className="adm-hint">(optional)</span>
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                autoComplete="off"
              />
            </label>
            <label>
              Password <span className="adm-hint">(min 12 chars)</span>
              <input
                type="password"
                required
                minLength={12}
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                autoComplete="new-password"
              />
            </label>
            <label>
              Role
              <select
                value={createRole}
                onChange={(e) => setCreateRole(e.target.value as Role)}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="adm-drawer-actions">
            <button type="submit" className="btn-primary" disabled={creating} aria-busy={creating}>
              {creating ? 'Creating…' : 'Create user'}
            </button>
            <button
              type="button"
              className="adm-btn-quiet"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {errorMsg ? (
        <div className="adm-error-banner" role="alert">
          <Warning size="1em" weight="bold" aria-hidden="true" /> {errorMsg}
        </div>
      ) : null}

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th scope="col">Email</th>
              <th scope="col">Name</th>
              <th scope="col">Role</th>
              <th scope="col">Last login</th>
              <th scope="col">Created</th>
              <th scope="col" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="adm-table-empty">
                  No users yet. Create one above.
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const isMe = callerId !== null && r.id === callerId;
                return (
                  <tr key={r.id} aria-busy={busyId === r.id}>
                    <td>
                      {r.email}
                      {isMe ? <span className="adm-hint"> (you)</span> : null}
                    </td>
                    <td>{r.name || '—'}</td>
                    <td>
                      <select
                        className="adm-status-select"
                        value={r.role}
                        onChange={(e) => updateRole(r.id, e.target.value as Role)}
                        disabled={busyId === r.id}
                        aria-label={`Role for ${r.email}`}
                      >
                        {ROLES.map((rr) => (
                          <option key={rr} value={rr}>{rr}</option>
                        ))}
                      </select>
                    </td>
                    <td className="adm-cell-date">
                      {r.lastLogin ? new Date(r.lastLogin).toLocaleDateString() : 'never'}
                    </td>
                    <td className="adm-cell-date">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    {pendingDeleteId === r.id ? (
                      <td className="adm-cell-confirm">
                        <span className="adm-confirm-label">Delete {r.email}?</span>
                        <button
                          type="button"
                          className="adm-btn-danger"
                          onClick={() => confirmDelete(r.id)}
                        >
                          Yes, delete
                        </button>
                        <button
                          type="button"
                          className="adm-btn-quiet"
                          onClick={() => setPendingDeleteId(null)}
                        >
                          Cancel
                        </button>
                      </td>
                    ) : (
                      <td>
                        <button
                          type="button"
                          className="adm-btn-icon"
                          onClick={() => setPendingDeleteId(r.id)}
                          aria-label={`Delete ${r.email}`}
                          disabled={busyId === r.id || isMe}
                          title={isMe ? "You can't delete your own account" : undefined}
                        >
                          <Trash size="1em" aria-hidden="true" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
