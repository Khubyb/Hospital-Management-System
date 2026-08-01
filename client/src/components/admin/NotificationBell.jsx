import { useEffect, useRef, useState } from 'react';
import { FaBell } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/authService';

// Polls for doctors awaiting approval and shows them as a notification
// dropdown on the admin dashboard. Clicking an entry takes the admin
// straight to that doctor's full profile so they can approve or reject it.
const NotificationBell = () => {
  const [pending, setPending] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  const load = async () => {
    try {
      const res = await adminService.getAllDoctors();
      setPending((res.doctors || []).filter((d) => d.approvalStatus === 'pending'));
    } catch {
      // Fail silently here - the Doctors tab is still the source of truth
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goToDoctor = (id) => {
    setOpen(false);
    navigate(`/admin/dashboard/doctors?review=${id}`);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <FaBell />
        {pending.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {pending.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Pending doctor approvals
          </p>
          {pending.length === 0 ? (
            <p className="px-2 py-3 text-sm text-slate-500 dark:text-slate-400">You're all caught up.</p>
          ) : (
            <div className="max-h-80 space-y-1 overflow-y-auto">
              {pending.map((doc) => (
                <button
                  key={doc._id}
                  onClick={() => goToDoctor(doc._id)}
                  className="block w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <p className="font-medium text-slate-800 dark:text-white">Dr. {doc.fullName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {doc.specialization} &middot; wants approval to sign up
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
