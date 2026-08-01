import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaCalendarCheck, FaCalendarPlus, FaFileMedical, FaGear, FaHouse } from 'react-icons/fa6';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import ProfileSettingsForm from '../../components/settings/ProfileSettingsForm.jsx';
import { appointmentService } from '../../services/authService';
import BookAppointment from './BookAppointment.jsx';

const links = [
  { to: '/patient/dashboard', label: 'Overview', icon: FaHouse, end: true },
  { to: '/patient/dashboard/book', label: 'Book Appointment', icon: FaCalendarPlus },
  { to: '/patient/dashboard/records', label: 'Medical Records', icon: FaFileMedical },
  { to: '/patient/dashboard/settings', label: 'Settings', icon: FaGear },
];

// Overview tab: stats + upcoming appointments list with cancel action
const Overview = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAppointments = async () => {
    try {
      const res = await appointmentService.getAll();
      setAppointments(res.appointments);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleCancel = async (id) => {
    const reason = window.prompt('Reason for cancellation (optional):') || '';
    try {
      await appointmentService.updateStatus(id, { status: 'cancelled', reason });
      toast.success('Appointment cancelled');
      loadAppointments();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const statusColors = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-primary-100 text-primary-700',
    rejected: 'bg-red-100 text-red-700',
    cancelled: 'bg-slate-100 text-slate-500',
  };

  const counts = appointments.reduce(
    (acc, a) => ({ ...acc, [a.status]: (acc[a.status] || 0) + 1 }),
    {}
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Pending', value: counts.pending || 0 },
          { label: 'Approved', value: counts.approved || 0 },
          { label: 'Completed', value: counts.completed || 0 },
          { label: 'Cancelled', value: counts.cancelled || 0 },
        ].map((stat) => (
          <motion.div key={stat.label} whileHover={{ y: -4 }} className="glass-card p-5">
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-slate-800 dark:text-white">
          <FaCalendarCheck className="text-primary-600" /> Your Appointments
        </h2>

        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : appointments.length === 0 ? (
          <p className="text-sm text-slate-500">No appointments yet. Book one to get started.</p>
        ) : (
          <div className="space-y-3">
            {appointments.map((a) => (
              <div
                key={a._id}
                className="flex flex-col justify-between gap-2 rounded-xl border border-slate-100 p-4 dark:border-slate-800 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium text-slate-800 dark:text-white">Dr. {a.doctor?.fullName}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {a.department?.name} &middot; {new Date(a.date).toDateString()} at {a.startTime}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusColors[a.status]}`}>
                    {a.status}
                  </span>
                  {['pending', 'approved'].includes(a.status) && (
                    <button onClick={() => handleCancel(a._id)} className="text-xs font-medium text-red-500 hover:underline">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Medical Records tab: every appointment the doctor has marked completed,
// treated as this patient's visit history.
const MedicalRecords = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentService
      .getAll({ status: 'completed' })
      .then((res) => setAppointments(res.appointments))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-slate-500">Loading medical records...</p>;

  return (
    <div className="glass-card p-6">
      <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-slate-800 dark:text-white">
        <FaFileMedical className="text-primary-600" /> Medical Records
      </h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        A record is added here automatically once a doctor marks your appointment as completed.
      </p>

      {appointments.length === 0 ? (
        <p className="text-sm text-slate-500">No completed visits yet.</p>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <div key={a._id} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-slate-800 dark:text-white">Dr. {a.doctor?.fullName}</p>
                <span className="text-xs font-semibold text-slate-400">{new Date(a.date).toDateString()}</span>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {a.doctor?.specialization} {a.department?.name ? `· ${a.department.name}` : ''} &middot; {a.startTime}
              </p>
              {a.reasonForVisit && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-medium">Reason for visit:</span> {a.reasonForVisit}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PatientDashboard = () => {
  return (
    <DashboardLayout links={links} title="Patient Dashboard">
      <Routes>
        <Route index element={<Overview />} />
        <Route path="book" element={<BookAppointment />} />
        <Route path="records" element={<MedicalRecords />} />
        <Route path="settings" element={<ProfileSettingsForm />} />
      </Routes>
    </DashboardLayout>
  );
};

export default PatientDashboard;
