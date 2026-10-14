import type { TaskStatus } from "@/lib/store";

interface TaskRow {
  id: string;
  description: string;
  agent: string;
  status: TaskStatus;
  completed: string;
}

function StatusPill({ status }: { status: TaskStatus }) {
  const styles: Record<TaskStatus, string> = {
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

export function RecentTasks({ tasks }: { tasks: TaskRow[] }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900">
      <div className="border-b border-zinc-800 px-5 py-4">
        <h2 className="text-sm font-semibold text-zinc-100">Recent Tasks</h2>
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
          {tasks.map((task) => (
            <tr key={task.id}>
              <td className="px-5 py-3 text-zinc-100">{task.description}</td>
              <td className="px-5 py-3 text-zinc-400">{task.agent}</td>
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
