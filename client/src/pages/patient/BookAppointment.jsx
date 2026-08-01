import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { doctorService, departmentService, appointmentService } from '../../services/authService';

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const BookAppointment = () => {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filters, setFilters] = useState({ department: '', search: '' });
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [form, setForm] = useState({ date: '', startTime: '', reasonForVisit: '' });
  const [slots, setSlots] = useState([]);
  const [usingFallback, setUsingFallback] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
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

  const selectDoctor = (doc) => {
    setSelectedDoctor(doc);
    setForm({ date: '', startTime: '', reasonForVisit: '' });
    setSlots([]);
  };

  // Whenever the date changes, ask the server which of this doctor's shifts
  // are actually still open on that day (already-booked slots excluded).
  useEffect(() => {
    if (!selectedDoctor || !form.date) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    setForm((f) => ({ ...f, startTime: '' }));
    doctorService
      .getAvailableSlots(selectedDoctor._id, form.date)
      .then((res) => {
        setSlots(res.slots);
        setUsingFallback(res.usingFallback);
      })
      .catch((err) => {
        toast.error(err.message);
        setSlots([]);
      })
      .finally(() => setLoadingSlots(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDoctor, form.date]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) return toast.error('Please select a doctor first');
    if (!form.startTime) return toast.error('Please pick an available time slot');

    const slot = slots.find((s) => s.startTime === form.startTime);

    setSubmitting(true);
    try {
      await appointmentService.book({
        doctorId: selectedDoctor._id,
        departmentId: selectedDoctor.department?._id,
        date: form.date,
        startTime: form.startTime,
        endTime: slot.endTime,
        reasonForVisit: form.reasonForVisit,
      });
      toast.success('Appointment requested! You will be notified once the doctor confirms.');
      setSelectedDoctor(null);
      setForm({ date: '', startTime: '', reasonForVisit: '' });
      setSlots([]);
    } catch (err) {
      toast.error(err.message);
      // Someone may have just grabbed this slot - refresh the list so it's not offered again
      if (form.date) {
        doctorService.getAvailableSlots(selectedDoctor._id, form.date).then((res) => setSlots(res.slots)).catch(() => {});
      }
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
              onClick={() => selectDoctor(doc)}
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
              <p className="mt-2 text-sm font-semibold text-primary-600 dark:text-primary-400">
                {doc.consultationFee ? `$${doc.consultationFee} consultation fee` : 'Fee not set'}
              </p>
            </button>
          ))}
          {doctors.length === 0 && <p className="text-sm text-slate-500">No doctors match your search.</p>}
        </div>
      </div>

      {selectedDoctor && (
        <form onSubmit={handleBook} className="glass-card space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-lg font-semibold text-slate-800 dark:text-white">
              Book with Dr. {selectedDoctor.fullName}
            </h3>
            <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-semibold text-primary-700 dark:bg-slate-800 dark:text-primary-300">
              {selectedDoctor.consultationFee ? `$${selectedDoctor.consultationFee} per visit` : 'Fee not set'}
            </span>
          </div>

          {selectedDoctor.availability?.length > 0 ? (
            <div className="flex flex-wrap gap-2 text-xs">
              {[...selectedDoctor.availability]
                .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day))
                .map((d) => (
                  <span
                    key={d.day}
                    className="rounded-full bg-slate-100 px-3 py-1 capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {d.day}: {d.slots.map((s) => `${s.startTime}-${s.endTime}`).join(', ')}
                  </span>
                ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This doctor hasn't set specific hours yet — you're free to pick any time between 9:00 AM and 5:00 PM.
            </p>
          )}

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
              {!form.date ? (
                <p className="mt-2 text-sm text-slate-400">Pick a date to see open times</p>
              ) : loadingSlots ? (
                <p className="mt-2 text-sm text-slate-400">Checking availability...</p>
              ) : slots.length === 0 ? (
                <p className="mt-2 text-sm text-red-500">No open slots this day — try another date</p>
              ) : (
                <>
                  {usingFallback && (
                    <p className="mb-2 text-xs text-slate-400">Showing general hours (9:00 AM – 5:00 PM)</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {slots.map((s) => (
                      <button
                        key={s.startTime}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, startTime: s.startTime }))}
                        className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                          form.startTime === s.startTime
                            ? 'border-primary-500 bg-primary-500 text-white'
                            : 'border-slate-200 text-slate-600 hover:border-primary-300 dark:border-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {s.startTime}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
              Reason for Visit <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              rows={3}
              className="input-field"
              placeholder="Briefly describe what you'd like to see the doctor about"
              value={form.reasonForVisit}
              onChange={(e) => setForm((f) => ({ ...f, reasonForVisit: e.target.value }))}
            />
          </div>

          <button type="submit" disabled={submitting || !form.startTime} className="btn-primary w-full sm:w-auto">
            {submitting ? 'Booking...' : 'Confirm Appointment'}
          </button>
        </form>
      )}
    </div>
  );
};

export default BookAppointment;
