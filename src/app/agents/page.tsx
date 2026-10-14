"use client";

import { useState } from "react";
import { useStore, type Agent, type Task } from "@/lib/store";

function StatusBadge({ status }: { status: "idle" | "working" }) {
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

function AgentCard({
  agent,
  tasks,
  expanded,
  onToggle,
  instruction,
  onInstructionChange,
  onDispatch,
}: {
  agent: Agent;
  tasks: Task[];
  expanded: boolean;
  onToggle: () => void;
  instruction: string;
  onInstructionChange: (value: string) => void;
  onDispatch: () => void;
}) {
  const isOrchestrator = agent.isOrchestrator;

  return (
    <div
      className={`rounded-lg border ${
        isOrchestrator
          ? "border-violet-500/40 bg-gradient-to-br from-violet-500/10 to-zinc-900"
          : "border-zinc-800 bg-zinc-900"
      }`}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <div className="flex items-center gap-2">
            <p
              className={`font-medium ${
                isOrchestrator
                  ? "text-base text-zinc-50"
                  : "text-sm text-zinc-100"
              }`}
            >
              {agent.name}
            </p>
            {isOrchestrator && (
              <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-300">
                Talk to me first
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400">{agent.role}</p>
        </div>
        <div className="flex items-center gap-5">
          <span className="text-xs text-zinc-500">{agent.provider}</span>
          <span className="text-xs text-zinc-400">{agent.lastActive}</span>
          <StatusBadge status={agent.status} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-zinc-800 px-5 py-4">
          <label className="mb-2 block text-xs font-medium text-zinc-400">
            {isOrchestrator
              ? "Tell the orchestrator what you need"
              : "Give this agent a task"}
          </label>
          <textarea
            value={instruction}
            onChange={(e) => onInstructionChange(e.target.value)}
            placeholder={`e.g. "${agent.role}, for the Q3 launch"`}
            rows={3}
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600"
          />
          <div className="mt-3 flex justify-end">
            <button
              onClick={onDispatch}
              className={`rounded-md px-4 py-2 text-sm font-medium ${
                isOrchestrator
                  ? "bg-violet-500 text-white hover:bg-violet-400"
                  : "bg-zinc-100 text-zinc-900 hover:bg-white"
              }`}
            >
              Dispatch Task
            </button>
          </div>

          {tasks.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-medium text-zinc-400">
                Task history
              </p>
              <ul className="divide-y divide-zinc-800 rounded-md border border-zinc-800">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between px-3 py-2 text-xs"
                  >
                    <span className="text-zinc-300">{task.instruction}</span>
                    <span className="text-zinc-500">{task.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AgentsPage() {
  const { agents, tasks, currentOrgId, addAgent, dispatchTask } = useStore();

  const orgAgents = agents.filter((a) => a.orgId === currentOrgId);
  const orchestrator = orgAgents.find((a) => a.isOrchestrator);
  const specialists = orgAgents.filter((a) => !a.isOrchestrator);

  const [expandedId, setExpandedId] = useState<string | null>(
    orchestrator?.id ?? null,
  );
  const [instructions, setInstructions] = useState<Record<string, string>>({});
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");

  function handleDispatch(agentId: string) {
    const instruction = (instructions[agentId] ?? "").trim();
    if (!instruction) return;
    dispatchTask(agentId, instruction);
    setInstructions((prev) => ({ ...prev, [agentId]: "" }));
  }

  function handleAddAgent(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newRole.trim()) return;
    addAgent({ name: newName.trim(), role: newRole.trim() });
    setNewName("");
    setNewRole("");
    setShowAddAgent(false);
  }

  function renderCard(agent: Agent) {
    return (
      <AgentCard
        key={agent.id}
        agent={agent}
        tasks={tasks.filter((t) => t.agentId === agent.id)}
        expanded={expandedId === agent.id}
        onToggle={() =>
          setExpandedId(expandedId === agent.id ? null : agent.id)
        }
        instruction={instructions[agent.id] ?? ""}
        onInstructionChange={(value) =>
          setInstructions((prev) => ({ ...prev, [agent.id]: value }))
        }
        onDispatch={() => handleDispatch(agent.id)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddAgent((v) => !v)}
          className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
        >
          Add New Agent
        </button>
      </div>

      {showAddAgent && (
        <form
          onSubmit={handleAddAgent}
          className="rounded-lg border border-zinc-800 bg-zinc-900 p-5"
        >
          <h2 className="mb-3 text-sm font-semibold text-zinc-100">
            New Agent
          </h2>
          <div className="flex gap-3">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name, e.g. Analyst"
              className="flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600"
            />
            <input
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="Role, e.g. Analyzes sales data"
              className="flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600"
            />
            <button
              type="submit"
              className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
            >
              Create
            </button>
          </div>
        </form>
      )}

      {orchestrator && renderCard(orchestrator)}

      {specialists.length > 0 && (
        <div className="flex flex-col gap-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Specialized Agents
          </p>
          {specialists.map(renderCard)}
        </div>
      )}
    </div>
  );
}
