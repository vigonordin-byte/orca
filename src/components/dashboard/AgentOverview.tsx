import type { Agent } from "@/lib/store";

function StatusBadge({ status }: { status: Agent["status"] }) {
  const isWorking = status === "working";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isWorking
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-zinc-700/40 text-zinc-400"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isWorking ? "bg-emerald-400" : "bg-zinc-500"
        }`}
      />
      {isWorking ? "Working" : "Idle"}
    </span>
  );
}

export function AgentOverview({ agents }: { agents: Agent[] }) {
  const sorted = [...agents].sort(
    (a, b) => Number(b.isOrchestrator) - Number(a.isOrchestrator),
  );

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900">
      <div className="border-b border-zinc-800 px-5 py-4">
        <h2 className="text-sm font-semibold text-zinc-100">
          Agent Overview
        </h2>
      </div>
      <ul className="divide-y divide-zinc-800">
        {sorted.map((agent) => (
          <li
            key={agent.id}
            className={`flex items-center justify-between px-5 py-3.5 ${
              agent.isOrchestrator
                ? "border-l-2 border-violet-500 bg-violet-500/5"
                : ""
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-zinc-100">
                  {agent.name}
                </p>
                {agent.isOrchestrator && (
                  <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-300">
                    Orchestrator
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-zinc-400">{agent.role}</p>
            </div>
            <div className="flex items-center gap-5">
              <span className="text-xs text-zinc-500">{agent.provider}</span>
              <span className="text-xs text-zinc-400">
                {agent.lastActive}
              </span>
              <StatusBadge status={agent.status} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
