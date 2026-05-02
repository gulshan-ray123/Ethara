import { Plus, Trash2, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../api/client.js";
import EmptyState from "../components/EmptyState.jsx";
import FieldError from "../components/FieldError.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const emptyForm = { title: "", description: "", members: [] };

const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const isAdmin = user.role === "Admin";

  const membersById = useMemo(() => new Map(users.map((item) => [item._id, item])), [users]);

  const load = async () => {
    const [projectResponse, userResponse] = await Promise.all([
      api.get("/projects"),
      isAdmin ? api.get("/users") : Promise.resolve({ data: [] })
    ]);
    setProjects(projectResponse.data);
    setUsers(userResponse.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleMember = (id) => {
    setForm((current) => ({
      ...current,
      members: current.members.includes(id)
        ? current.members.filter((memberId) => memberId !== id)
        : [...current.members, id]
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/projects", form);
      setProjects((current) => [data, ...current]);
      setForm(emptyForm);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not create project");
    }
  };

  const remove = async (id) => {
    await api.delete(`/projects/${id}`);
    setProjects((current) => current.filter((project) => project._id !== id));
  };

  if (loading) return <div className="panel p-5 text-sm font-semibold">Loading projects</div>;

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-black">Projects</h2>
          <p className="mt-1 text-sm text-stone-500">
            {isAdmin ? "Create projects and choose team members." : "Projects where you are a member."}
          </p>
        </div>

        {isAdmin && (
          <form className="panel space-y-4 p-5" onSubmit={submit}>
            <div className="flex items-center gap-2">
              <Plus size={18} className="text-moss" />
              <h3 className="font-black">New project</h3>
            </div>
            <div className="space-y-2">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                required
                minLength={2}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                rows={4}
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <label>Members</label>
              <div className="max-h-52 space-y-2 overflow-auto rounded-md border border-stone-200 p-2">
                {users.map((member) => (
                  <label key={member._id} className="flex cursor-pointer items-center gap-2 rounded-md p-2 normal-case tracking-normal hover:bg-stone-50">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={form.members.includes(member._id)}
                      onChange={() => toggleMember(member._id)}
                    />
                    <span className="text-sm font-semibold text-ink">{member.name}</span>
                    <span className="text-xs text-stone-500">{member.role}</span>
                  </label>
                ))}
              </div>
            </div>
            <FieldError message={error} />
            <button className="btn-primary w-full">
              <Plus size={16} />
              Create project
            </button>
          </form>
        )}
      </section>

      <section>
        {projects.length === 0 ? (
          <EmptyState title="No projects yet" description="Project cards will appear after an admin creates them." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {projects.map((project) => (
              <article key={project._id} className="panel p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black">{project.title}</h3>
                    <p className="mt-1 text-sm text-stone-500">{project.description}</p>
                  </div>
                  {isAdmin && (
                    <button className="btn-danger px-2" onClick={() => remove(project._id)} aria-label="Delete project">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-stone-600">
                  <Users size={16} />
                  {project.members.length} members
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.members.map((member) => {
                    const detail = member.name ? member : membersById.get(member);
                    return (
                      <span key={member._id || member} className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-700">
                        {detail?.name || "Member"}
                      </span>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProjectsPage;
