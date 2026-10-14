import type { ActivityItem } from "@/lib/store";

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900">
      <div className="border-b border-zinc-800 px-5 py-4">
        <h2 className="text-sm font-semibold text-zinc-100">
          Live Activity
        </h2>
      </div>
      <ul className="divide-y divide-zinc-800">
        {items.map((item) => (
          <li key={item.id} className="px-5 py-3 text-sm text-zinc-300">
            <span className="font-medium text-zinc-100">{item.agent}</span>{" "}
            {item.action}
            <span className="text-zinc-500">, {item.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
