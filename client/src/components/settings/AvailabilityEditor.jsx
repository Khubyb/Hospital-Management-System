import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash } from 'react-icons/fa6';
import { useAuth } from '../../context/AuthContext.jsx';
import { doctorService } from '../../services/authService';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// Turns the backend's [{ day, slots: [{startTime, endTime}] }] shape into a
// day -> shifts map that's easier to render/edit, e.g. a doctor can give
// Monday two shifts: 09:00-12:00 and 18:00-21:00.
const toShiftMap = (availability = []) => {
  const map = {};
  DAYS.forEach((d) => (map[d] = []));
  availability.forEach(({ day, slots }) => {
    // `saved: true` marks a shift that already exists on the server, so we
    // know it can be cancelled immediately (via the API) instead of only
    // being removed locally pending a "Save Availability" click.
    map[day] = (slots || []).map((s) => ({ startTime: s.startTime, endTime: s.endTime, saved: true }));
  });
  return map;
};

const AvailabilityEditor = () => {
  const { user, setUser } = useAuth();
  const [shiftMap, setShiftMap] = useState(toShiftMap(user?.availability));
  const [saving, setSaving] = useState(false);
  const [cancellingKey, setCancellingKey] = useState(null);

  useEffect(() => {
    setShiftMap(toShiftMap(user?.availability));
  }, [user]);

  const addShift = (day) => {
    setShiftMap((m) => ({ ...m, [day]: [...m[day], { startTime: '09:00', endTime: '12:00', saved: false }] }));
  };

  // Removing a shift behaves differently depending on whether it's already
  // saved on the server:
  // - Not yet saved (just added / edited locally): remove it from local
  //   state only, pending the next "Save Availability" click.
  // - Already saved: this is a doctor saying "I'm busy that day after all" —
  //   cancel that one shift immediately via the API, without disturbing the
  //   rest of the saved schedule or requiring a separate Save step.
  const removeShift = async (day, index) => {
    const shift = shiftMap[day][index];
    if (!shift.saved) {
      setShiftMap((m) => ({ ...m, [day]: m[day].filter((_, i) => i !== index) }));
      return;
    }

    const confirmed = window.confirm(
      `Cancel your ${day} shift (${shift.startTime}–${shift.endTime})? Patients will no longer be able to book you during this time.`
    );
    if (!confirmed) return;

    const key = `${day}-${shift.startTime}-${shift.endTime}`;
    setCancellingKey(key);
    try {
      const res = await doctorService.cancelAvailabilitySlot(day, shift.startTime, shift.endTime);
      setShiftMap(toShiftMap(res.availability));
      setUser((u) => ({ ...u, availability: res.availability }));
      toast.success('Shift cancelled');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancellingKey(null);
    }
  };

  const updateShift = (day, index, field, value) => {
    setShiftMap((m) => ({
      // Editing the time of an already-saved shift means it no longer
      // matches what's on the server, so it goes back to "pending save"
      // until the doctor hits Save Availability again.
      ...m,
      [day]: m[day].map((s, i) => (i === index ? { ...s, [field]: value, saved: false } : s)),
    }));
  };

  const handleSave = async () => {
    // Basic sanity check before saving: every shift's end time must be after its start time
    for (const day of DAYS) {
      for (const shift of shiftMap[day]) {
        if (shift.startTime >= shift.endTime) {
          toast.error(`Fix the ${day} shift — end time must be after start time`);
          return;
        }
      }
    }

    const availability = DAYS.filter((d) => shiftMap[d].length > 0).map((day) => ({
      day,
      slots: shiftMap[day].map((s) => ({ startTime: s.startTime, endTime: s.endTime, isBooked: false })),
    }));

    setSaving(true);
    try {
      const res = await doctorService.updateAvailability(availability);
      // Previously this only showed a success toast without updating the
      // AuthContext user, so `user.availability` stayed stale — the next
      // time this component mounted (e.g. after navigating away and back)
      // it would re-render from the old, empty availability and the
      // doctor's saved schedule would appear to have vanished. Updating
      // both local state and the shared user object fixes that.
      setShiftMap(toShiftMap(res.availability));
      setUser((u) => ({ ...u, availability: res.availability }));
      toast.success('Availability updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card p-6">
      <h2 className="mb-1 font-display text-lg font-semibold text-slate-800 dark:text-white">Availability</h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        Set the days and hours you see patients. Add more than one shift per day if you split your hours — for
        example 9:00–12:00 in the morning and 18:00–21:00 in the evening.
      </p>
      <p className="mb-4 text-xs text-slate-400">
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">Live</span> shifts are already visible
        to patients — hit the trash icon to cancel one immediately if you're suddenly busy that day, no need to press
        Save. <span className="font-semibold text-amber-600 dark:text-amber-400">Unsaved</span> shifts are new or
        edited and only take effect once you click Save Availability.
      </p>

      <div className="space-y-4">
        {DAYS.map((day) => (
          <div key={day} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-medium capitalize text-slate-800 dark:text-white">{day}</p>
              <button
                type="button"
                onClick={() => addShift(day)}
                className="flex items-center gap-1 rounded-lg bg-primary-100 px-2.5 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-200 dark:bg-slate-800 dark:text-primary-300"
              >
                <FaPlus size={10} /> Add Shift
              </button>
            </div>

            {shiftMap[day].length === 0 ? (
              <p className="text-xs text-slate-400">Not available this day</p>
            ) : (
              <div className="space-y-2">
                {shiftMap[day].map((shift, i) => {
                  const key = `${day}-${shift.startTime}-${shift.endTime}`;
                  const isCancelling = cancellingKey === key;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="time"
                        className="input-field !py-1.5 text-sm"
                        value={shift.startTime}
                        onChange={(e) => updateShift(day, i, 'startTime', e.target.value)}
                      />
                      <span className="text-slate-400">to</span>
                      <input
                        type="time"
                        className="input-field !py-1.5 text-sm"
                        value={shift.endTime}
                        onChange={(e) => updateShift(day, i, 'endTime', e.target.value)}
                      />
                      {shift.saved ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                          Live
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                          Unsaved
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeShift(day, i)}
                        disabled={isCancelling}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/40"
                        aria-label={shift.saved ? 'Cancel this shift' : 'Remove shift'}
                        title={shift.saved ? "Busy this day? Cancel this specific shift right away" : 'Remove this unsaved shift'}
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-primary mt-6 px-6 py-2 text-sm">
        {saving ? 'Saving...' : 'Save Availability'}
      </button>
    </div>
  );
};

export default AvailabilityEditor;
