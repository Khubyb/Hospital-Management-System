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
    map[day] = (slots || []).map((s) => ({ startTime: s.startTime, endTime: s.endTime }));
  });
  return map;
};

const AvailabilityEditor = () => {
  const { user } = useAuth();
  const [shiftMap, setShiftMap] = useState(toShiftMap(user?.availability));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setShiftMap(toShiftMap(user?.availability));
  }, [user]);

  const addShift = (day) => {
    setShiftMap((m) => ({ ...m, [day]: [...m[day], { startTime: '09:00', endTime: '12:00' }] }));
  };

  const removeShift = (day, index) => {
    setShiftMap((m) => ({ ...m, [day]: m[day].filter((_, i) => i !== index) }));
  };

  const updateShift = (day, index, field, value) => {
    setShiftMap((m) => ({
      ...m,
      [day]: m[day].map((s, i) => (i === index ? { ...s, [field]: value } : s)),
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
      await doctorService.updateAvailability(availability);
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
                {shiftMap[day].map((shift, i) => (
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
                    <button
                      type="button"
                      onClick={() => removeShift(day, i)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                      aria-label="Remove shift"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
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
