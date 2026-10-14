"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";

export default function OrganizationsPage() {
  const { organizations, agents, currentOrgId, setCurrentOrgId, addOrganization } =
    useStore();
  const [name, setName] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    addOrganization(trimmed);
    setName("");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 px-5 py-4">
          <h2 className="text-sm font-semibold text-zinc-100">
            Organizations
          </h2>
        </div>
        <ul className="divide-y divide-zinc-800">
          {organizations.map((org) => {
            const agentCount = agents.filter((a) => a.orgId === org.id).length;
            const active = org.id === currentOrgId;
            return (
              <li
                key={org.id}
                className="flex items-center justify-between px-5 py-3.5"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-100">
                    {org.name}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {agentCount} agent{agentCount === 1 ? "" : "s"}
                  </p>
                </div>
                <button
                  onClick={() => setCurrentOrgId(org.id)}
                  disabled={active}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "bg-zinc-800 text-zinc-500"
                      : "border border-zinc-700 text-zinc-100 hover:bg-zinc-800"
                  }`}
                >
                  {active ? "Current" : "Switch to"}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <form
        onSubmit={handleAdd}
        className="rounded-lg border border-zinc-800 bg-zinc-900 p-5"
      >
        <h2 className="mb-3 text-sm font-semibold text-zinc-100">
          Add Organization
        </h2>
        <div className="flex gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Client B"
            className="flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600"
          />
          <button
            type="submit"
            className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
