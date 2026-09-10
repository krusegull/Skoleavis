"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Role, SchoolYear, User, RoleAssignment } from "@prisma/client";
import { ROLE_LABELS, ROLE_ORDER } from "@/lib/constants";

type UserWithRoles = User & { roleAssignments: (RoleAssignment & { schoolYear: SchoolYear })[] };

export function UserAdminPanel({
  users,
  schoolYears,
  currentSchoolYearId,
}: {
  users: UserWithRoles[];
  schoolYears: SchoolYear[];
  currentSchoolYearId: string | null;
}) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(Role.JOURNALIST);
  const [isStudent, setIsStudent] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [newPasswords, setNewPasswords] = useState<Record<string, string>>({});

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        isStudent,
        schoolYearId: currentSchoolYearId ?? undefined,
      }),
    });

    setCreating(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setCreateError(data.error?.formErrors?.[0] || data.error || "Kunne ikke opprette bruker.");
      return;
    }
    setName("");
    setEmail("");
    setPassword("");
    setIsStudent(true);
    router.refresh();
  }

  async function toggleActive(user: UserWithRoles) {
    setBusyId(user.id);
    await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ active: !user.active }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function toggleStudent(user: UserWithRoles) {
    setBusyId(user.id);
    await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isStudent: !user.isStudent }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function changeRole(userId: string, newRole: Role) {
    if (!currentSchoolYearId) return;
    setBusyId(userId);
    await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ roleAssignment: { role: newRole, schoolYearId: currentSchoolYearId } }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function resetPassword(userId: string) {
    const newPassword = newPasswords[userId];
    if (!newPassword || newPassword.length < 8) {
      alert("Passordet må være minst 8 tegn.");
      return;
    }
    setBusyId(userId);
    await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });
    setBusyId(null);
    setNewPasswords((prev) => ({ ...prev, [userId]: "" }));
    router.refresh();
  }

  function currentRole(user: UserWithRoles): Role | null {
    return user.roleAssignments.find((a) => a.schoolYearId === currentSchoolYearId)?.role ?? null;
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="section-label border-b border-ink/30 pb-1">Opprett ny konto</h2>
        <form onSubmit={createUser} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <input
            required
            placeholder="Navn"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-ink/30 bg-white px-3 py-2 font-serif text-sm"
          />
          <input
            required
            type="email"
            placeholder="E-post"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-ink/30 bg-white px-3 py-2 font-serif text-sm"
          />
          <input
            required
            type="password"
            placeholder="Passord (min. 8 tegn)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-ink/30 bg-white px-3 py-2 font-serif text-sm"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="border border-ink/30 bg-white px-3 py-2 font-serif text-sm"
          >
            {ROLE_ORDER.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 font-sans text-xs text-muted">
            <input type="checkbox" checked={isStudent} onChange={(e) => setIsStudent(e.target.checked)} />
            Elev
          </label>
          <button
            type="submit"
            disabled={creating || !currentSchoolYearId}
            className="border border-ink bg-ink px-3 py-2 font-sans text-xs uppercase tracking-wide text-paper hover:bg-accent hover:border-accent disabled:opacity-50"
          >
            {creating ? "Oppretter…" : "Opprett"}
          </button>
        </form>
        {!currentSchoolYearId && (
          <p className="mt-2 font-serif text-sm text-accent">
            Sett opp et gjeldende skoleår under "Avslutt skoleår" før du oppretter kontoer.
          </p>
        )}
        <p className="mt-2 font-serif text-xs text-muted">
          Elever vises aldri på den offentlige Redaksjonen-siden, uavhengig av rolle.
        </p>
        {createError && <p className="mt-2 font-serif text-sm text-accent">{String(createError)}</p>}
      </section>

      <section>
        <h2 className="section-label border-b border-ink/30 pb-1">Alle kontoer</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse font-serif text-sm">
            <thead>
              <tr className="border-b border-ink/30 text-left font-sans text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-4">Navn</th>
                <th className="py-2 pr-4">E-post</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Elev</th>
                <th className="py-2 pr-4">Rolle ({schoolYears.find((y) => y.id === currentSchoolYearId)?.label ?? "-"})</th>
                <th className="py-2 pr-4">Nytt passord</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-ink/10 align-middle">
                  <td className="py-2 pr-4">{user.name}</td>
                  <td className="py-2 pr-4 text-muted">{user.email}</td>
                  <td className="py-2 pr-4">
                    <button
                      disabled={busyId === user.id}
                      onClick={() => toggleActive(user)}
                      className={`border px-2 py-1 font-sans text-xs uppercase tracking-wide disabled:opacity-50 ${
                        user.active ? "border-ink hover:bg-ink hover:text-paper" : "border-accent text-accent"
                      }`}
                    >
                      {user.active ? "Aktiv — deaktiver" : "Deaktivert — reaktiver"}
                    </button>
                  </td>
                  <td className="py-2 pr-4">
                    <input
                      type="checkbox"
                      checked={user.isStudent}
                      disabled={busyId === user.id}
                      onChange={() => toggleStudent(user)}
                      title="Skjuler kontoen fra den offentlige Redaksjonen-siden"
                    />
                  </td>
                  <td className="py-2 pr-4">
                    <select
                      value={currentRole(user) ?? ""}
                      disabled={busyId === user.id || !currentSchoolYearId}
                      onChange={(e) => changeRole(user.id, e.target.value as Role)}
                      className="border border-ink/30 bg-white px-2 py-1 text-sm"
                    >
                      <option value="" disabled>
                        Ingen rolle
                      </option>
                      {ROLE_ORDER.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-4">
                    <div className="flex gap-1">
                      <input
                        type="password"
                        placeholder="min. 8 tegn"
                        value={newPasswords[user.id] ?? ""}
                        onChange={(e) => setNewPasswords((prev) => ({ ...prev, [user.id]: e.target.value }))}
                        className="w-32 border border-ink/30 bg-white px-2 py-1 text-sm"
                      />
                      <button
                        disabled={busyId === user.id}
                        onClick={() => resetPassword(user.id)}
                        className="border border-ink px-2 py-1 font-sans text-xs uppercase tracking-wide hover:bg-ink hover:text-paper disabled:opacity-50"
                      >
                        Sett
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
