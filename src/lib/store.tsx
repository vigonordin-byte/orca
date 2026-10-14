"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
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

const POLL_INTERVAL_MS = 4000;

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `Request to ${url} failed`);
  }
  return res.json();
}

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
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrgId, setCurrentOrgId] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<ActivityItem[]>([]);
  const currentOrgIdRef = useRef(currentOrgId);
  currentOrgIdRef.current = currentOrgId;

  const refresh = useCallback(async () => {
    const [orgs, agentList, taskList, eventList] = await Promise.all([
      fetchJson<Organization[]>("/api/organizations"),
      fetchJson<Agent[]>("/api/agents"),
      fetchJson<Task[]>("/api/tasks"),
      fetchJson<ActivityItem[]>("/api/events"),
    ]);

    setOrganizations(orgs);
    setAgents(agentList);
    setTasks(taskList);
    setEvents(eventList);

    if (!currentOrgIdRef.current && orgs.length > 0) {
      setCurrentOrgId(orgs[0].id);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  const addOrganization = useCallback(
    (name: string) => {
      (async () => {
        const org = await fetchJson<Organization>("/api/organizations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        setCurrentOrgId(org.id);
        await refresh();
      })();
    },
    [refresh],
  );

  const addAgent = useCallback(
    (input: { name: string; role: string }) => {
      (async () => {
        await fetchJson<Agent>("/api/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...input, orgId: currentOrgIdRef.current }),
        });
        await refresh();
      })();
    },
    [refresh],
  );

  const dispatchTask = useCallback(
    (agentId: string, instruction: string) => {
      (async () => {
        await fetchJson<Task>("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentId, instruction }),
        });
        await refresh();
      })();
    },
    [refresh],
  );

  const value: StoreValue = {
    organizations,
    currentOrgId,
    setCurrentOrgId,
    addOrganization,
    agents,
    addAgent,
    tasks,
    events,
    dispatchTask,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
