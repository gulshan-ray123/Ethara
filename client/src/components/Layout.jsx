import { FolderKanban, LayoutDashboard, LogOut, Menu, SquareCheckBig, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/tasks", label: "Tasks", icon: SquareCheckBig }
];

const Layout = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cloud">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button className="btn-secondary md:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
              <Menu size={18} />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-moss text-white">
              <SquareCheckBig size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold">Team Task Manager</h1>
              <p className="text-xs text-stone-500">{user.role} workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-stone-500">{user.email}</p>
            </div>
            <button className="btn-secondary" onClick={logout}>
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-[220px_1fr]">
        <aside className="hidden min-h-[calc(100vh-65px)] border-r border-stone-200 bg-white px-3 py-5 md:block">
          <Nav />
        </aside>

        {open && (
          <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setOpen(false)}>
            <aside className="h-full w-72 bg-white p-4" onClick={(event) => event.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <span className="font-bold">Navigation</span>
                <button className="btn-secondary" onClick={() => setOpen(false)} aria-label="Close navigation">
                  <X size={18} />
                </button>
              </div>
              <Nav onNavigate={() => setOpen(false)} />
            </aside>
          </div>
        )}

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const Nav = ({ onNavigate }) => (
  <nav className="space-y-1">
    {navItems.map(({ to, label, icon: Icon }) => (
      <NavLink
        key={to}
        to={to}
        end={to === "/"}
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition ${
            isActive ? "bg-moss text-white" : "text-stone-600 hover:bg-stone-100 hover:text-ink"
          }`
        }
      >
        <Icon size={18} />
        {label}
      </NavLink>
    ))}
  </nav>
);

export default Layout;
