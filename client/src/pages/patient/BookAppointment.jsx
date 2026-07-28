import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { doctorService, departmentService, appointmentService } from '../../services/authService';

// Lets a patient search doctors by department/name/experience, then book a
// slot. Time slots here are a simple fixed list for demo purposes — a real
// build would read doctor.availability and grey out already-booked slots.
const DEMO_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00'];

const BookAppointment = () => {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filters, setFilters] = useState({ department: '', search: '' });
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [form, setForm] = useState({ date: '', startTime: '', reasonForVisit: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    departmentService.getAll().then((res) => setDepartments(res.departments)).catch(() => {});
  }, []);

  const searchDoctors = async () => {
    try {
      const res = await doctorService.search(filters);
      setDoctors(res.doctors);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    searchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) return toast.error('Please select a doctor first');

    const [h, m] = form.startTime.split(':').map(Number);
    const endMinutes = h * 60 + m + 30;
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;

    setSubmitting(true);
    try {
      await appointmentService.book({
        doctorId: selectedDoctor._id,
        departmentId: selectedDoctor.department?._id,
        date: form.date,
        startTime: form.startTime,
        endTime,
        reasonForVisit: form.reasonForVisit,
      });
      toast.success('Appointment requested! You will be notified once the doctor confirms.');
      setSelectedDoctor(null);
      setForm({ date: '', startTime: '', reasonForVisit: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-slate-800 dark:text-white">Find a Doctor</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            className="input-field sm:w-56"
            value={filters.department}
            onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
          <input
            className="input-field flex-1"
            placeholder="Search by name or specialization"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
          <button onClick={searchDoctors} className="btn-primary sm:w-32">
            Search
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {doctors.map((doc) => (
            <button
              key={doc._id}
              onClick={() => setSelectedDoctor(doc)}
              className={`rounded-xl border p-4 text-left transition ${
                selectedDoctor?._id === doc._id
                  ? 'border-primary-500 bg-primary-50 dark:bg-slate-800'
                  : 'border-slate-100 hover:border-primary-200 dark:border-slate-800'
              }`}
            >
              <p className="font-medium text-slate-800 dark:text-white">Dr. {doc.fullName}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {doc.specialization} &middot; {doc.yearsOfExperience} yrs experience
              </p>
              <p className="mt-1 text-xs text-slate-400">{doc.department?.name}</p>
            </button>
          ))}
          {doctors.length === 0 && <p className="text-sm text-slate-500">No doctors match your search.</p>}
        </div>
      </div>

      {selectedDoctor && (
        <form onSubmit={handleBook} className="glass-card space-y-4 p-6">
          <h3 className="font-display text-lg font-semibold text-slate-800 dark:text-white">
            Book with Dr. {selectedDoctor.fullName}
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Date</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                className="input-field"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Time Slot</label>
              <select
                required
                className="input-field"
                value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
              >
                <option value="">Select a time</option>
                {DEMO_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Reason for Visit</label>
            <textarea
              required
              rows={3}
              className="input-field"
              value={form.reasonForVisit}
              onChange={(e) => setForm((f) => ({ ...f, reasonForVisit: e.target.value }))}
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
            {submitting ? 'Booking...' : 'Confirm Appointment'}
          </button>
        </form>
      )}
    </div>
  );
};

export default BookAppointment;
