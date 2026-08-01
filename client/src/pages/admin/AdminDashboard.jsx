import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Routes, Route, useSearchParams } from 'react-router-dom';
import { FaHouse, FaUserDoctor, FaUserInjured, FaHospital } from 'react-icons/fa6';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import NotificationBell from '../../components/admin/NotificationBell.jsx';
import UserDetailPanel from '../../components/admin/UserDetailPanel.jsx';
import { adminService, departmentService } from '../../services/authService';

const links = [
  { to: '/admin/dashboard', label: 'Overview', icon: FaHouse, end: true },
  { to: '/admin/dashboard/doctors', label: 'Doctors', icon: FaUserDoctor },
  { to: '/admin/dashboard/patients', label: 'Patients', icon: FaUserInjured },
  { to: '/admin/dashboard/departments', label: 'Departments', icon: FaHospital },
];

const StatCard = ({ label, value }) => (
  <motion.div whileHover={{ y: -4 }} className="glass-card p-5">
    <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
  </motion.div>
);

const Overview = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminService
      .getStats()
      .then((res) => setStats(res.stats))
      .catch((err) => toast.error(err.message));
  }, []);

  if (!stats) return <p className="text-sm text-slate-500">Loading dashboard...</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Patients" value={stats.totalPatients} />
        <StatCard label="Total Doctors" value={stats.totalDoctors} />
        <StatCard label="Pending Doctor Approvals" value={stats.pendingDoctorApprovals} />
        <StatCard label="Departments" value={stats.totalDepartments} />
      </div>

      <div className="glass-card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-slate-800 dark:text-white">
          Appointments Overview
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <StatCard label="Total" value={stats.totalAppointments} />
          <StatCard label="Pending" value={stats.appointmentsByStatus.pending || 0} />
          <StatCard label="Approved" value={stats.appointmentsByStatus.approved || 0} />
          <StatCard label="Completed" value={stats.appointmentsByStatus.completed || 0} />
          <StatCard label="Cancelled" value={stats.appointmentsByStatus.cancelled || 0} />
        </div>
      </div>
    </div>
  );
};

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeId, setActiveId] = useState(null);

  const load = async () => {
    try {
      const res = await adminService.getAllDoctors();
      setDoctors(res.doctors);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Deep-link support: clicking a notification lands here with ?review=<id>
  // and immediately opens that doctor's full profile.
  useEffect(() => {
    const reviewId = searchParams.get('review');
    if (reviewId) setActiveId(reviewId);
  }, [searchParams]);

  const closeModal = () => {
    setActiveId(null);
    if (searchParams.get('review')) {
      searchParams.delete('review');
      setSearchParams(searchParams, { replace: true });
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      await adminService.setUserActiveStatus(id, !isActive);
      toast.success(!isActive ? 'Account activated' : 'Account deactivated');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const statusBadge = (doc) => {
    if (doc.approvalStatus === 'approved')
      return <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Approved</span>;
    if (doc.approvalStatus === 'rejected')
      return <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">Rejected</span>;
    return <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Pending Review</span>;
  };

  if (loading) return <p className="text-sm text-slate-500">Loading doctors...</p>;

  if (activeId) {
    return <UserDetailPanel userId={activeId} type="doctor" onBack={closeModal} onChanged={load} />;
  }

  return (
    <div className="glass-card p-6">
      <h2 className="mb-4 font-display text-lg font-semibold text-slate-800 dark:text-white">All Doctors</h2>
      {doctors.length === 0 ? (
        <p className="text-sm text-slate-500">No doctors have signed up yet.</p>
      ) : (
        <div className="space-y-3">
          {doctors.map((doc) => (
            <div
              key={doc._id}
              className="flex flex-col justify-between gap-2 rounded-xl border border-slate-100 p-4 dark:border-slate-800 sm:flex-row sm:items-center"
            >
              <div>
                <p className="font-medium text-slate-800 dark:text-white">Dr. {doc.fullName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {doc.specialization} &middot; {doc.email} &middot; License: {doc.medicalLicenseNumber}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {statusBadge(doc)}
                <button
                  onClick={() => setActiveId(doc._id)}
                  className="rounded-lg bg-primary-100 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-200 dark:bg-slate-800 dark:text-primary-300"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleToggleActive(doc._id, doc.isActive)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    doc.isActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {doc.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);

  const load = async () => {
    try {
      const res = await adminService.getAllPatients();
      setPatients(res.patients);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <p className="text-sm text-slate-500">Loading patients...</p>;

  if (activeId) {
    return <UserDetailPanel userId={activeId} type="patient" onBack={() => setActiveId(null)} onChanged={load} />;
  }

  return (
    <div className="glass-card p-6">
      <h2 className="mb-4 font-display text-lg font-semibold text-slate-800 dark:text-white">All Patients</h2>
      {patients.length === 0 ? (
        <p className="text-sm text-slate-500">No patients have signed up yet.</p>
      ) : (
        <div className="space-y-3">
          {patients.map((p) => (
            <div
              key={p._id}
              className="flex flex-col justify-between gap-2 rounded-xl border border-slate-100 p-4 dark:border-slate-800 sm:flex-row sm:items-center"
            >
              <div>
                <p className="font-medium text-slate-800 dark:text-white">{p.fullName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {p.email} &middot; {p.phone} &middot; {p.bloodGroup || 'Blood group not provided'}
                </p>
              </div>
              <button
                onClick={() => setActiveId(p._id)}
                className="w-fit rounded-lg bg-primary-100 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-200 dark:bg-slate-800 dark:text-primary-300"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    departmentService
      .getAll()
      .then((res) => setDepartments(res.departments))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-slate-500">Loading departments...</p>;

  return (
    <div className="glass-card p-6">
      <h2 className="mb-4 font-display text-lg font-semibold text-slate-800 dark:text-white">Departments</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {departments.map((d) => (
          <div key={d._id} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
            <p className="font-medium text-slate-800 dark:text-white">{d.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{d.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <DashboardLayout links={links} title="Admin Dashboard" headerExtra={<NotificationBell />}>
      <Routes>
        <Route index element={<Overview />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="patients" element={<Patients />} />
        <Route path="departments" element={<Departments />} />
      </Routes>
    </DashboardLayout>
  );
};

export default AdminDashboard;
