import { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext.jsx';
import { authService } from '../../services/authService';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Lets the logged-in patient or doctor update their own basic info.
// Fields shown depend on user.role. Admin/license/department/approval
// fields are intentionally left out here - those stay admin-managed.
const ProfileSettingsForm = () => {
  const { user, setUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
    gender: user?.gender || '',
    bloodGroup: user?.bloodGroup || '',
    addressStreet: user?.address?.street || '',
    addressCity: user?.address?.city || '',
    emergencyName: user?.emergencyContact?.name || '',
    emergencyPhone: user?.emergencyContact?.phone || '',
    emergencyRelationship: user?.emergencyContact?.relationship || '',
    specialization: user?.specialization || '',
    qualification: user?.qualification || '',
    yearsOfExperience: user?.yearsOfExperience ?? '',
    consultationFee: user?.consultationFee ?? '',
  });

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload =
        user.role === 'doctor'
          ? {
              fullName: form.fullName,
              phone: form.phone,
              specialization: form.specialization,
              qualification: form.qualification,
              yearsOfExperience: form.yearsOfExperience,
              consultationFee: form.consultationFee,
            }
          : {
              fullName: form.fullName,
              phone: form.phone,
              dateOfBirth: form.dateOfBirth,
              gender: form.gender,
              bloodGroup: form.bloodGroup,
              address: { street: form.addressStreet, city: form.addressCity },
              emergencyContact: {
                name: form.emergencyName,
                phone: form.emergencyPhone,
                relationship: form.emergencyRelationship,
              },
            };

      const res = await authService.updateProfile(payload);
      setUser(res.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6">
      <h2 className="mb-4 font-display text-lg font-semibold text-slate-800 dark:text-white">Profile Information</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full Name">
          <input className="input-field" value={form.fullName} onChange={handleChange('fullName')} required />
        </Field>
        <Field label="Email">
          <input className="input-field opacity-60" value={user?.email || ''} disabled />
        </Field>
        <Field label="Phone">
          <input className="input-field" value={form.phone} onChange={handleChange('phone')} />
        </Field>

        {user?.role === 'doctor' ? (
          <>
            <Field label="Specialization">
              <input className="input-field" value={form.specialization} onChange={handleChange('specialization')} />
            </Field>
            <Field label="Qualification">
              <input className="input-field" value={form.qualification} onChange={handleChange('qualification')} />
            </Field>
            <Field label="Years of Experience">
              <input type="number" min="0" className="input-field" value={form.yearsOfExperience} onChange={handleChange('yearsOfExperience')} />
            </Field>
            <Field label="Consultation Fee">
              <input type="number" min="0" className="input-field" value={form.consultationFee} onChange={handleChange('consultationFee')} />
            </Field>
          </>
        ) : (
          <>
            <Field label="Date of Birth">
              <input type="date" className="input-field" value={form.dateOfBirth} onChange={handleChange('dateOfBirth')} />
            </Field>
            <Field label="Gender">
              <select className="input-field" value={form.gender} onChange={handleChange('gender')}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Blood Group (optional)">
              <select className="input-field" value={form.bloodGroup} onChange={handleChange('bloodGroup')}>
                <option value="">Select</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Street / City">
              <input className="input-field" value={form.addressStreet} onChange={handleChange('addressStreet')} />
            </Field>
            <Field label="Emergency Contact Name (optional)">
              <input className="input-field" value={form.emergencyName} onChange={handleChange('emergencyName')} />
            </Field>
            <Field label="Emergency Contact Phone (optional)">
              <input className="input-field" value={form.emergencyPhone} onChange={handleChange('emergencyPhone')} />
            </Field>
          </>
        )}
      </div>

      <button type="submit" disabled={saving} className="btn-primary mt-6 px-6 py-2 text-sm">
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>
    {children}
  </div>
);

export default ProfileSettingsForm;
