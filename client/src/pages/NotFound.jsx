import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-950">
    <p className="font-display text-7xl font-extrabold gradient-text">404</p>
    <h1 className="mt-4 text-xl font-semibold text-slate-800 dark:text-white">Page not found</h1>
    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">The page you're looking for doesn't exist.</p>
    <Link to="/" className="btn-primary mt-6">
      Back to Home
    </Link>
  </div>
);

export default NotFound;
