import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import FieldError from "../components/FieldError.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const initial = { name: "", email: "", password: "", role: "Member" };

const AuthPage = () => {
  const { user, login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await signup(form);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen grid-cols-1 bg-cloud lg:grid-cols-[1fr_480px]">
      <section className="flex items-center px-6 py-10 sm:px-10 lg:px-16">
        <div className="max-w-2xl">
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-md bg-moss text-white">
            <ShieldCheck size={26} />
          </div>
          <h1 className="max-w-xl text-4xl font-black leading-tight text-ink sm:text-5xl">
            Team Task Manager
          </h1>
          <p className="mt-4 max-w-xl text-lg text-stone-600">
            Manage projects, assign work, track status, and keep every teammate focused from one clean workspace.
          </p>
          <div className="mt-8 grid gap-3 text-sm font-semibold text-stone-700 sm:grid-cols-2">
            {["JWT authentication", "Admin and member roles", "Project member control", "Task filters and dashboard"].map(
              (item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="text-moss" size={18} />
                  {item}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section className="flex items-center border-l border-stone-200 bg-white px-6 py-10 sm:px-10">
        <form className="w-full space-y-5" onSubmit={submit}>
          <div>
            <p className="text-sm font-bold text-moss">{mode === "login" ? "Welcome back" : "Create account"}</p>
            <h2 className="mt-1 text-2xl font-black">{mode === "login" ? "Login" : "Signup"}</h2>
          </div>

          <div className="grid grid-cols-2 rounded-md border border-stone-200 bg-stone-50 p-1">
            <button
              type="button"
              className={`rounded px-3 py-2 text-sm font-bold ${mode === "login" ? "bg-white shadow-sm" : ""}`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              type="button"
              className={`rounded px-3 py-2 text-sm font-bold ${mode === "signup" ? "bg-white shadow-sm" : ""}`}
              onClick={() => setMode("signup")}
            >
              Signup
            </button>
          </div>

          {mode === "signup" && (
            <>
              <div className="space-y-2">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" value={form.name} onChange={update} required minLength={2} />
              </div>
              <div className="space-y-2">
                <label htmlFor="role">Role</label>
                <select id="role" name="role" value={form.role} onChange={update}>
                  <option>Member</option>
                  <option>Admin</option>
                </select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={update} required />
          </div>
          <div className="space-y-2">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={update} required minLength={6} />
          </div>

          <FieldError message={error} />
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Please wait" : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default AuthPage;
