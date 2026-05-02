import { Filter, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../api/client.js";
import EmptyState from "../components/EmptyState.jsx";
import FieldError from "../components/FieldError.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatDate, toInputDate } from "../utils/date.js";

const emptyTask = {
  title: "",
  description: "",
  projectId: "",
  assignedTo: "",
  status: "To Do",
  dueDate: ""
};

const TasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyTask);
  const [filters, setFilters] = useState({ status: "", assignedTo: "", dueDate: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const isAdmin = user.role === "Admin";

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === form.projectId),
    [projects, form.projectId]
  );
  const assignableUsers = selectedProject?.members || users;

  const load = async () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
    const [taskResponse, projectResponse, userResponse] = await Promise.all([
      api.get("/tasks", { params }),
      api.get("/projects"),
      isAdmin ? api.get("/users") : Promise.resolve({ data: [] })
    ]);
    setTasks(taskResponse.data);
    setProjects(projectResponse.data);
    setUsers(userResponse.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value, ...(key === "projectId" ? { assignedTo: "" } : {}) }));
  };

  const createTask = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/tasks", form);
      setTasks((current) => [data, ...current]);
      setForm(emptyTask);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not create task");
    }
  };

  const updateStatus = async (task, status) => {
    const payload = isAdmin ? { ...task, projectId: task.projectId?._id, assignedTo: task.assignedTo?._id, status } : { status };
    const { data } = await api.put(`/tasks/${task._id}`, payload);
    setTasks((current) => current.map((item) => (item._id === task._id ? data : item)));
  };

  const remove = async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks((current) => current.filter((task) => task._id !== id));
  };

  const applyFilters = async (event) => {
    event.preventDefault();
    setLoading(true);
    await load();
  };

  if (loading) return <div className="panel p-5 text-sm font-semibold">Loading tasks</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black">Task Management</h2>
        <p className="mt-1 text-sm text-stone-500">
          {isAdmin ? "Assign, filter, update, and delete tasks." : "Review your tasks and move status forward."}
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <div className="space-y-4">
          {isAdmin && (
            <form className="panel space-y-4 p-5" onSubmit={createTask}>
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-moss" />
                <h3 className="font-black">New task</h3>
              </div>
              <TaskFields form={form} updateForm={updateForm} projects={projects} assignableUsers={assignableUsers} />
              <FieldError message={error} />
              <button className="btn-primary w-full">
                <Plus size={16} />
                Create task
              </button>
            </form>
          )}

          <form className="panel space-y-4 p-5" onSubmit={applyFilters}>
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-moss" />
              <h3 className="font-black">Filters</h3>
            </div>
            <div className="space-y-2">
              <label>Status</label>
              <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
                <option value="">All statuses</option>
                <option>To Do</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>
            {isAdmin && (
              <div className="space-y-2">
                <label>User</label>
                <select value={filters.assignedTo} onChange={(event) => setFilters((current) => ({ ...current, assignedTo: event.target.value }))}>
                  <option value="">All users</option>
                  {users.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-2">
              <label>Due date</label>
              <input type="date" value={filters.dueDate} onChange={(event) => setFilters((current) => ({ ...current, dueDate: event.target.value }))} />
            </div>
            <button className="btn-secondary w-full">
              <Filter size={16} />
              Apply filters
            </button>
          </form>
        </div>

        <div>
          {tasks.length === 0 ? (
            <EmptyState title="No tasks found" description="Create a task or adjust the filters to see more work." />
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <article key={task._id} className="panel p-4">
                  <div className="grid gap-4 lg:grid-cols-[1fr_190px_auto] lg:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black">{task.title}</h3>
                        <StatusBadge status={task.status} />
                      </div>
                      <p className="mt-2 text-sm text-stone-600">{task.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-stone-500">
                        <span>{task.projectId?.title || "Project"}</span>
                        <span>{task.assignedTo?.name || "Unassigned"}</span>
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label>Status</label>
                      <select value={task.status} onChange={(event) => updateStatus(task, event.target.value)}>
                        <option>To Do</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                      </select>
                    </div>
                    {isAdmin && (
                      <button className="btn-danger px-2" onClick={() => remove(task._id)} aria-label="Delete task">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const TaskFields = ({ form, updateForm, projects, assignableUsers }) => (
  <>
    <div className="space-y-2">
      <label>Title</label>
      <input value={form.title} onChange={(event) => updateForm("title", event.target.value)} required minLength={2} />
    </div>
    <div className="space-y-2">
      <label>Description</label>
      <textarea rows={3} value={form.description} onChange={(event) => updateForm("description", event.target.value)} required />
    </div>
    <div className="space-y-2">
      <label>Project</label>
      <select value={form.projectId} onChange={(event) => updateForm("projectId", event.target.value)} required>
        <option value="">Choose project</option>
        {projects.map((project) => (
          <option key={project._id} value={project._id}>
            {project.title}
          </option>
        ))}
      </select>
    </div>
    <div className="space-y-2">
      <label>Assigned user</label>
      <select value={form.assignedTo} onChange={(event) => updateForm("assignedTo", event.target.value)} required>
        <option value="">Choose member</option>
        {assignableUsers.map((member) => (
          <option key={member._id} value={member._id}>
            {member.name}
          </option>
        ))}
      </select>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-2">
        <label>Status</label>
        <select value={form.status} onChange={(event) => updateForm("status", event.target.value)}>
          <option>To Do</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
      </div>
      <div className="space-y-2">
        <label>Due date</label>
        <input type="date" value={toInputDate(form.dueDate)} onChange={(event) => updateForm("dueDate", event.target.value)} required />
      </div>
    </div>
  </>
);

export default TasksPage;
