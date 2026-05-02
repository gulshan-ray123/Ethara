import { AlertTriangle, CheckCircle2, ClipboardList, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/client.js";
import EmptyState from "../components/EmptyState.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { formatDate } from "../utils/date.js";

const cards = [
  { key: "total", label: "Total tasks", icon: ClipboardList, color: "bg-moss" },
  { key: "completed", label: "Completed", icon: CheckCircle2, color: "bg-emerald-600" },
  { key: "pending", label: "Pending", icon: Clock3, color: "bg-gold" },
  { key: "overdue", label: "Overdue", icon: AlertTriangle, color: "bg-coral" }
];

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/tasks/dashboard")
      .then(({ data }) => setSummary(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="panel p-5 text-sm font-semibold">Loading dashboard</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black">Dashboard</h2>
        <p className="mt-1 text-sm text-stone-500">A quick read on workload, completion, and deadlines.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="panel p-5">
            <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-md ${color} text-white`}>
              <Icon size={20} />
            </div>
            <p className="text-sm font-semibold text-stone-500">{label}</p>
            <p className="mt-1 text-3xl font-black">{summary?.[key] ?? 0}</p>
          </div>
        ))}
      </section>

      <section>
        <h3 className="mb-3 text-lg font-black">Assigned to you</h3>
        {summary.assignedTasks.length === 0 ? (
          <EmptyState title="No assigned tasks" description="Tasks assigned to you will appear here." />
        ) : (
          <div className="panel divide-y divide-stone-100">
            {summary.assignedTasks.map((task) => (
              <div key={task._id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                <div>
                  <p className="font-bold">{task.title}</p>
                  <p className="text-sm text-stone-500">{task.projectId?.title || "No project"}</p>
                </div>
                <StatusBadge status={task.status} />
                <p className="text-sm font-semibold text-stone-500">{formatDate(task.dueDate)}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
