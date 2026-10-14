"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AgentStatus = "idle" | "working";
export type TaskStatus = "In progress" | "Done" | "Error";

export interface Organization {
  id: string;
  name: string;
}

export interface Agent {
  id: string;
  orgId: string;
  name: string;
  role: string;
  status: AgentStatus;
  lastActive: string;
  provider: string;
  isOrchestrator?: boolean;
}

export interface Task {
  id: string;
  orgId: string;
  agentId: string;
  instruction: string;
  status: TaskStatus;
  completed: string;
}

export interface ActivityItem {
  id: string;
  orgId: string;
  agent: string;
  action: string;
  time: string;
}

let idCounter = 0;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

const initialOrganizations: Organization[] = [
  { id: "org-vigo", name: "Vigo" },
];

const initialAgents: Agent[] = [
  {
    id: "agent-orchestrator",
    orgId: "org-vigo",
    name: "Orchestrator",
    role: "Routes your requests to the right specialist agent",
    status: "idle",
    lastActive: "just now",
    provider: "Claude",
    isOrchestrator: true,
  },
  {
    id: "agent-researcher",
    orgId: "org-vigo",
    name: "Researcher",
    role: "Research assistant",
    status: "idle",
    lastActive: "12m ago",
    provider: "Claude",
  },
  {
    id: "agent-code-reviewer",
    orgId: "org-vigo",
    name: "Code Reviewer",
    role: "Reviews pull requests",
    status: "working",
    lastActive: "just now",
    provider: "Claude",
  },
  {
    id: "agent-copywriter",
    orgId: "org-vigo",
    name: "Copywriter",
    role: "Writes marketing copy",
    status: "idle",
    lastActive: "1h ago",
    provider: "Claude",
  },
  {
    id: "agent-qa-tester",
    orgId: "org-vigo",
    name: "QA Tester",
    role: "Tests features",
    status: "working",
    lastActive: "3m ago",
    provider: "Claude",
  },
];

const initialTasks: Task[] = [
  {
    id: "task-1",
    orgId: "org-vigo",
    agentId: "agent-researcher",
    instruction: "Analyze competitor pricing pages",
    status: "Done",
    completed: "7m ago",
  },
  {
    id: "task-2",
    orgId: "org-vigo",
    agentId: "agent-code-reviewer",
    instruction: "Review PR #482 auth refactor",
    status: "In progress",
    completed: "–",
  },
  {
    id: "task-3",
    orgId: "org-vigo",
    agentId: "agent-copywriter",
    instruction: "Draft launch announcement copy",
    status: "Done",
    completed: "42m ago",
  },
  {
    id: "task-4",
    orgId: "org-vigo",
    agentId: "agent-qa-tester",
    instruction: "Run regression suite on checkout flow",
    status: "In progress",
    completed: "–",
  },
  {
    id: "task-5",
    orgId: "org-vigo",
    agentId: "agent-researcher",
    instruction: "Summarize user feedback from last week",
    status: "Error",
    completed: "1h ago",
  },
];

const initialEvents: ActivityItem[] = [
  {
    id: "event-1",
    orgId: "org-vigo",
    agent: "Code Reviewer",
    action: "started reviewing PR #482 auth refactor",
    time: "2m ago",
  },
  {
    id: "event-2",
    orgId: "org-vigo",
    agent: "QA Tester",
    action: "started the regression suite on checkout flow",
    time: "5m ago",
  },
  {
    id: "event-3",
    orgId: "org-vigo",
    agent: "Researcher",
    action: "finished analyzing competitor pricing pages",
    time: "7m ago",
  },
  {
    id: "event-4",
    orgId: "org-vigo",
    agent: "Copywriter",
    action: "finished drafting launch announcement copy",
    time: "42m ago",
  },
  {
    id: "event-5",
    orgId: "org-vigo",
    agent: "Researcher",
    action: "hit an error summarizing user feedback",
    time: "1h ago",
  },
];

interface StoreValue {
  organizations: Organization[];
  currentOrgId: string;
  setCurrentOrgId: (id: string) => void;
  addOrganization: (name: string) => void;

  agents: Agent[];
  addAgent: (input: { name: string; role: string }) => void;

  tasks: Task[];
  events: ActivityItem[];
  dispatchTask: (agentId: string, instruction: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [organizations, setOrganizations] = useState(initialOrganizations);
  const [currentOrgId, setCurrentOrgId] = useState(initialOrganizations[0].id);
  const [agents, setAgents] = useState(initialAgents);
  const [tasks, setTasks] = useState(initialTasks);
  const [events, setEvents] = useState(initialEvents);

  const addOrganization = useCallback((name: string) => {
    const org: Organization = { id: nextId("org"), name };
    setOrganizations((prev) => [...prev, org]);
    setCurrentOrgId(org.id);
    setAgents((prev) => [
      ...prev,
      {
        id: nextId("agent"),
        orgId: org.id,
        name: "Orchestrator",
        role: "Routes your requests to the right specialist agent",
        status: "idle",
        lastActive: "just now",
        provider: "Claude",
        isOrchestrator: true,
      },
    ]);
  }, []);

  const addAgent = useCallback(
    (input: { name: string; role: string }) => {
      setAgents((prev) => [
        ...prev,
        {
          id: nextId("agent"),
          orgId: currentOrgId,
          name: input.name,
          role: input.role,
          status: "idle",
          lastActive: "just now",
          provider: "Claude",
        },
      ]);
    },
    [currentOrgId],
  );

  const dispatchTask = useCallback(
    (agentId: string, instruction: string) => {
      const requestedAgent = agents.find((a) => a.id === agentId);
      if (!requestedAgent) return;

      const orgId = requestedAgent.orgId;
      const shortInstruction =
        instruction.length > 60
          ? `${instruction.slice(0, 60)}…`
          : instruction;

      // If the orchestrator is asked, it delegates to a specialist in the
      // same org instead of doing the work itself.
      let executor = requestedAgent;
      if (requestedAgent.isOrchestrator) {
        const specialists = agents.filter(
          (a) => a.orgId === orgId && !a.isOrchestrator,
        );
        if (specialists.length > 0) {
          executor =
            specialists[Math.floor(Math.random() * specialists.length)];
          setEvents((prev) => [
            {
              id: nextId("event"),
              orgId,
              agent: requestedAgent.name,
              action: `routed "${shortInstruction}" to ${executor.name}`,
              time: "just now",
            },
            ...prev,
          ]);
        }
      }

      const taskId = nextId("task");

      setTasks((prev) => [
        {
          id: taskId,
          orgId,
          agentId: executor.id,
          instruction,
          status: "In progress",
          completed: "–",
        },
        ...prev,
      ]);

      setAgents((prev) =>
        prev.map((a) =>
          a.id === executor.id
            ? { ...a, status: "working", lastActive: "just now" }
            : a,
        ),
      );

      setEvents((prev) => [
        {
          id: nextId("event"),
          orgId,
          agent: executor.name,
          action: `started "${shortInstruction}"`,
          time: "just now",
        },
        ...prev,
      ]);

      const succeeds = Math.random() > 0.15;

      setTimeout(() => {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: succeeds ? "Done" : "Error",
                  completed: "just now",
                }
              : t,
          ),
        );

        setAgents((prev) =>
          prev.map((a) =>
            a.id === executor.id
              ? { ...a, status: "idle", lastActive: "just now" }
              : a,
          ),
        );

        setEvents((prev) => [
          {
            id: nextId("event"),
            orgId,
            agent: executor.name,
            action: succeeds
              ? `finished "${shortInstruction}"`
              : `hit an error on "${shortInstruction}"`,
            time: "just now",
          },
          ...prev,
        ]);
      }, 4000);
    },
    [agents],
  );

  const value = useMemo(
    () => ({
      organizations,
      currentOrgId,
      setCurrentOrgId,
      addOrganization,
      agents,
      addAgent,
      tasks,
      events,
      dispatchTask,
    }),
    [
      organizations,
      currentOrgId,
      addOrganization,
      agents,
      addAgent,
      tasks,
      events,
      dispatchTask,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
