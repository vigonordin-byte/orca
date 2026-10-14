import Link from "next/link";

export function QuickActions() {
  return (
    <div className="flex gap-3">
      <Link
        href="/agents"
        className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-white"
      >
        Create New Task
      </Link>
      <Link
        href="/agents"
        className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-800"
      >
        Add New Agent
      </Link>
    </div>
  );
}
