import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaCalendarCheck, FaHouse, FaUserGroup, FaGear } from 'react-icons/fa6';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import ProfileSettingsForm from '../../components/settings/ProfileSettingsForm.jsx';
import AvailabilityEditor from '../../components/settings/AvailabilityEditor.jsx';
import { appointmentService } from '../../services/authService';

const links = [
  { to: '/doctor/dashboard', label: 'Overview', icon: FaHouse, end: true },
  { to: '/doctor/dashboard/patients', label: 'Patients', icon: FaUserGroup },
  { to: '/doctor/dashboard/settings', label: 'Settings', icon: FaGear },
];

const Overview = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
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
    load();
  }, []);

  const act = async (id, status) => {
    const reason = status === 'rejected' ? window.prompt('Reason for rejection:') || '' : undefined;
    try {
      await appointmentService.updateStatus(id, { status, reason });
      toast.success(`Appointment ${status}`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const pending = appointments.filter((a) => a.status === 'pending');
  const upcoming = appointments.filter((a) => a.status === 'approved');
  const completed = appointments.filter((a) => a.status === 'completed');
  const uniquePatients = new Set(appointments.map((a) => a.patient?._id).filter(Boolean));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: 'Total Patients', value: uniquePatients.size },
          { label: 'Requests Received', value: pending.length },
          { label: 'Upcoming', value: upcoming.length },
          { label: 'Completed', value: completed.length },
          { label: 'Total Appointments', value: appointments.length },
        ].map((s) => (
          <motion.div key={s.label} whileHover={{ y: -4 }} className="glass-card p-5">
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{s.value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-slate-800 dark:text-white">
          <FaCalendarCheck className="text-primary-600" /> Appointment Requests
        </h2>

        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : appointments.length === 0 ? (
          <p className="text-sm text-slate-500">No appointments yet.</p>
        ) : (
          <div className="space-y-3">
            {appointments.map((a) => (
              <div
                key={a._id}
                className="flex flex-col justify-between gap-2 rounded-xl border border-slate-100 p-4 dark:border-slate-800 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium text-slate-800 dark:text-white">{a.patient?.fullName}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(a.date).toDateString()} at {a.startTime} &middot; {a.reasonForVisit}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {a.status === 'pending' && (
                    <>
                      <button onClick={() => act(a._id, 'approved')} className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-200">
                        Approve
                      </button>
                      <button onClick={() => act(a._id, 'rejected')} className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200">
                        Reject
                      </button>
                    </>
                  )}
                  {a.status === 'approved' && (
                    <button onClick={() => act(a._id, 'completed')} className="rounded-lg bg-primary-100 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-200">
                      Mark Completed
                    </button>
                  )}
                  {['completed', 'rejected', 'cancelled'].includes(a.status) && (
                    <span className="text-xs font-semibold capitalize text-slate-400">{a.status}</span>
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

// Patients tab: groups this doctor's appointments by patient so they can see,
// at a glance, who's requested, who's upcoming, and who's been treated.
const PatientsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentService
      .getAll()
      .then((res) => setAppointments(res.appointments))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-slate-500">Loading patients...</p>;

  const byPatient = {};
  appointments.forEach((a) => {
    const id = a.patient?._id;
    if (!id) return;
    if (!byPatient[id]) {
      byPatient[id] = { patient: a.patient, total: 0, pending: 0, completed: 0, upcoming: 0 };
    }
    byPatient[id].total += 1;
    if (a.status === 'pending') byPatient[id].pending += 1;
    if (a.status === 'approved') byPatient[id].upcoming += 1;
    if (a.status === 'completed') byPatient[id].completed += 1;
  });
  const patients = Object.values(byPatient);

  return (
    <div className="glass-card p-6">
      <h2 className="mb-4 font-display text-lg font-semibold text-slate-800 dark:text-white">Your Patients</h2>
      {patients.length === 0 ? (
        <p className="text-sm text-slate-500">No patients yet — they'll show up here once someone books with you.</p>
      ) : (
        <div className="space-y-3">
          {patients.map(({ patient, total, pending, upcoming, completed }) => (
            <div
              key={patient._id}
              className="flex flex-col justify-between gap-2 rounded-xl border border-slate-100 p-4 dark:border-slate-800 sm:flex-row sm:items-center"
            >
              <div>
                <p className="font-medium text-slate-800 dark:text-white">{patient.fullName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{patient.email}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {total} total
                </span>
                {pending > 0 && <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">{pending} pending</span>}
                {upcoming > 0 && <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">{upcoming} upcoming</span>}
                {completed > 0 && <span className="rounded-full bg-primary-100 px-3 py-1 text-primary-700">{completed} completed</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DoctorDashboard = () => {
  return (
    <DashboardLayout links={links} title="Doctor Dashboard">
      <Routes>
        <Route index element={<Overview />} />
        <Route path="patients" element={<PatientsList />} />
        <Route
          path="settings"
          element={
            <div className="space-y-6">
              <ProfileSettingsForm />
              <AvailabilityEditor />
            </div>
          }
        />
      </Routes>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
