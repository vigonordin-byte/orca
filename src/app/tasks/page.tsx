"use client";

import { useStore } from "@/lib/store";

function StatusPill({ status }: { status: "In progress" | "Done" | "Error" }) {
  const styles: Record<string, string> = {
    "In progress": "bg-amber-500/10 text-amber-400",
    Done: "bg-emerald-500/10 text-emerald-400",
    Error: "bg-red-500/10 text-red-400",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export default function TasksPage() {
  const { tasks, agents, currentOrgId } = useStore();

  const orgTasks = tasks.filter((t) => t.orgId === currentOrgId);
  const agentName = (agentId: string) =>
    agents.find((a) => a.id === agentId)?.name ?? "Unknown";

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900">
      <div className="border-b border-zinc-800 px-5 py-4">
        <h2 className="text-sm font-semibold text-zinc-100">All Tasks</h2>
      </div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs text-zinc-500">
            <th className="px-5 py-2 font-medium">Task</th>
            <th className="px-5 py-2 font-medium">Agent</th>
            <th className="px-5 py-2 font-medium">Status</th>
            <th className="px-5 py-2 font-medium">Completed</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {orgTasks.map((task) => (
            <tr key={task.id}>
              <td className="px-5 py-3 text-zinc-100">{task.instruction}</td>
              <td className="px-5 py-3 text-zinc-400">
                {agentName(task.agentId)}
              </td>
              <td className="px-5 py-3">
                <StatusPill status={task.status} />
              </td>
              <td className="px-5 py-3 text-zinc-400">{task.completed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
