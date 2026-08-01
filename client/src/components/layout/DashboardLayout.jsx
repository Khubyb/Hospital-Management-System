import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRightFromBracket, FaHeartPulse } from 'react-icons/fa6';
import { useAuth } from '../../context/AuthContext.jsx';
import ThemeToggle from '../ui/ThemeToggle.jsx';
import { toast } from 'react-toastify';

// Shared shell for Patient and Doctor dashboards: sidebar nav (passed in as
// `links`), a topbar with dark-mode toggle + logout, and an animated content area.
const DashboardLayout = ({ links, children, title, headerExtra }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.info('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 md:flex">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-cyan-500">
            <FaHeartPulse className="text-white" />
          </div>
          <span className="font-display text-lg font-bold text-slate-800 dark:text-white">HMS</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-slate-800 dark:text-primary-300'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                }`
              }
            >
              <link.icon />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <FaRightFromBracket /> Log Out
        </button>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white/70 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
          <div>
            <h1 className="font-display text-xl font-bold text-slate-800 dark:text-white">{title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back, {user?.fullName?.split(' ')[0]}</p>
          </div>
          <div className="flex items-center gap-3">
            {headerExtra}
            <ThemeToggle />
          </div>
        </header>

        <motion.main
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 overflow-y-auto p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default DashboardLayout;
