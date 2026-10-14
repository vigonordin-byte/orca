"use client";

import { StatCard } from "@/components/dashboard/StatCard";
import { AgentOverview } from "@/components/dashboard/AgentOverview";
import { RecentTasks } from "@/components/dashboard/RecentTasks";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useStore } from "@/lib/store";

export default function DashboardPage() {
  const { agents, tasks, events, currentOrgId } = useStore();

  const orgAgents = agents.filter((a) => a.orgId === currentOrgId);
  const orgTasks = tasks.filter((t) => t.orgId === currentOrgId);
  const orgEvents = events.filter((e) => e.orgId === currentOrgId);

  const agentName = (agentId: string) =>
    orgAgents.find((a) => a.id === agentId)?.name ?? "Unknown";

  const recentTasks = orgTasks.slice(0, 5).map((t) => ({
    id: t.id,
    description: t.instruction,
    agent: agentName(t.agentId),
    status: t.status,
    completed: t.completed,
  }));

  const stats = {
    totalAgents: orgAgents.length,
    currentlyWorking: orgAgents.filter((a) => a.status === "working").length,
    completedToday: orgTasks.filter((t) => t.status === "Done").length,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Agents" value={stats.totalAgents} />
        <StatCard label="Currently Working" value={stats.currentlyWorking} />
        <StatCard label="Completed Today" value={stats.completedToday} />
      </div>

      <QuickActions />

      <div className="grid grid-cols-2 gap-6">
        <AgentOverview agents={orgAgents} />
        <ActivityFeed items={orgEvents.slice(0, 6)} />
      </div>

      <RecentTasks tasks={recentTasks} />
    </div>
  );
}
