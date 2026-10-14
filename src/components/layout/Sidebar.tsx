"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/agents", label: "Agents" },
  { href: "/tasks", label: "Tasks" },
  { href: "/organizations", label: "Organizations" },
  { href: "/settings", label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { organizations, currentOrgId, setCurrentOrgId } = useStore();

  return (
    <aside className="w-56 shrink-0 border-r border-zinc-800 bg-zinc-950 px-4 py-6">
      <div className="mb-6 px-2 text-lg font-semibold tracking-tight text-zinc-100">
        Orca
      </div>

      <select
        value={currentOrgId}
        onChange={(e) => setCurrentOrgId(e.target.value)}
        className="mb-6 w-full rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-2 text-sm text-zinc-200"
      >
        {organizations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
