import { Link } from 'react-router-dom';

const Unauthorized = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-950">
    <p className="font-display text-7xl font-extrabold gradient-text">403</p>
    <h1 className="mt-4 text-xl font-semibold text-slate-800 dark:text-white">Access denied</h1>
    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">You don't have permission to view this page.</p>
    <Link to="/" className="btn-primary mt-6">
      Back to Home
    </Link>
  </div>
);

export default Unauthorized;
