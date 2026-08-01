import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaArrowLeft } from 'react-icons/fa6';
import { adminService, departmentService } from '../../services/authService';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Full-detail view/edit/approve/reject/delete panel shared by the admin's
// Doctors and Patients tabs. Rendered as a normal page (not a dimmed modal
// overlay) so the details are always shown clearly. `type` is 'doctor' | 'patient'.
const UserDetailPanel = ({ userId, type, onBack, onChanged }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [departments, setDepartments] = useState([]);
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLoading(true);
    adminService
      .getUserDetail(userId)
      .then((res) => {
        setUser(res.user);
        setForm(toFormShape(res.user));
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));

    if (type === 'doctor') {
      departmentService.getAll().then((res) => setDepartments(res.departments || [])).catch(() => {});
    }
  }, [userId, type]);

  const toFormShape = (u) => ({
    fullName: u.fullName || '',
    email: u.email || '',
    phone: u.phone || '',
    // patient fields
    dateOfBirth: u.dateOfBirth ? u.dateOfBirth.slice(0, 10) : '',
    gender: u.gender || '',
    bloodGroup: u.bloodGroup || '',
    addressStreet: u.address?.street || '',
    addressCity: u.address?.city || '',
    emergencyName: u.emergencyContact?.name || '',
    emergencyPhone: u.emergencyContact?.phone || '',
    emergencyRelationship: u.emergencyContact?.relationship || '',
    // doctor fields
    medicalLicenseNumber: u.medicalLicenseNumber || '',
    specialization: u.specialization || '',
    qualification: u.qualification || '',
    yearsOfExperience: u.yearsOfExperience ?? '',
    consultationFee: u.consultationFee ?? '',
    department: u.department?._id || u.department || '',
  });

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    setBusy(true);
    try {
      const payload =
        type === 'patient'
          ? {
              fullName: form.fullName,
              email: form.email,
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
            }
          : {
              fullName: form.fullName,
              email: form.email,
              phone: form.phone,
              medicalLicenseNumber: form.medicalLicenseNumber,
              specialization: form.specialization,
              qualification: form.qualification,
              yearsOfExperience: form.yearsOfExperience,
              consultationFee: form.consultationFee,
              department: form.department,
            };

      const res = await adminService.updateUser(userId, payload);
      setUser(res.user);
      setEditing(false);
      toast.success('Details updated');
      onChanged?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete ${user.fullName}'s account? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await adminService.deleteUser(userId);
      toast.success('Account deleted');
      onChanged?.();
      onBack();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleApprove = async () => {
    setBusy(true);
    try {
      const res = await adminService.approveDoctor(userId);
      setUser((u) => ({ ...u, ...res.doctor }));
      toast.success('Doctor approved');
      onChanged?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    setBusy(true);
    try {
      const res = await adminService.rejectDoctor(userId, rejectReason);
      setUser((u) => ({ ...u, ...res.doctor }));
      setShowRejectBox(false);
      toast.info('Doctor application rejected');
      onChanged?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass-card p-6">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <FaArrowLeft size={12} /> Back to list
      </button>

      <h2 className="mb-4 font-display text-lg font-bold text-slate-800 dark:text-white">
        {type === 'doctor' ? 'Doctor Profile' : 'Patient Profile'}
      </h2>

      {loading || !user ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <>
          {type === 'doctor' && user.approvalStatus === 'pending' && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
              This doctor is awaiting your review before they can log in or appear in search.
            </div>
          )}
          {type === 'doctor' && user.approvalStatus === 'rejected' && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              Rejected{user.rejectionReason ? `: ${user.rejectionReason}` : '.'}
            </div>
          )}

          {editing ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextField label="Full Name" value={form.fullName} onChange={handleChange('fullName')} />
              <TextField label="Email" value={form.email} onChange={handleChange('email')} />
              <TextField label="Phone" value={form.phone} onChange={handleChange('phone')} />

              {type === 'patient' ? (
                <>
                  <TextField type="date" label="Date of Birth" value={form.dateOfBirth} onChange={handleChange('dateOfBirth')} />
                  <SelectField
                    label="Gender"
                    value={form.gender}
                    onChange={handleChange('gender')}
                    options={['male', 'female', 'other']}
                  />
                  <SelectField label="Blood Group" value={form.bloodGroup} onChange={handleChange('bloodGroup')} options={BLOOD_GROUPS} />
                  <TextField label="Street / City" value={form.addressStreet} onChange={handleChange('addressStreet')} />
                  <TextField label="Emergency Contact Name" value={form.emergencyName} onChange={handleChange('emergencyName')} />
                  <TextField label="Emergency Contact Phone" value={form.emergencyPhone} onChange={handleChange('emergencyPhone')} />
                </>
              ) : (
                <>
                  <TextField label="Medical License #" value={form.medicalLicenseNumber} onChange={handleChange('medicalLicenseNumber')} />
                  <TextField label="Specialization" value={form.specialization} onChange={handleChange('specialization')} />
                  <TextField label="Qualification" value={form.qualification} onChange={handleChange('qualification')} />
                  <TextField
                    type="number"
                    label="Years of Experience"
                    value={form.yearsOfExperience}
                    onChange={handleChange('yearsOfExperience')}
                  />
                  <TextField type="number" label="Consultation Fee" value={form.consultationFee} onChange={handleChange('consultationFee')} />
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Department</label>
                    <select className="input-field" value={form.department} onChange={handleChange('department')}>
                      <option value="">Unassigned</option>
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
              <Detail label="Full Name" value={user.fullName} />
              <Detail label="Email" value={user.email} />
              <Detail label="Phone" value={user.phone} />
              <Detail label="Status" value={user.isActive ? 'Active' : 'Deactivated'} />
              <Detail label="Email Verified" value={user.isEmailVerified ? 'Yes' : 'No'} />
              <Detail label="Joined" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'} />

              {type === 'patient' ? (
                <>
                  <Detail label="Date of Birth" value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : '-'} />
                  <Detail label="Gender" value={user.gender} />
                  <Detail label="Blood Group" value={user.bloodGroup || 'Not provided'} />
                  <Detail label="Address" value={user.address?.street || 'Not provided'} />
                  <Detail label="Emergency Contact" value={user.emergencyContact?.name || 'Not provided'} />
                  <Detail label="Emergency Phone" value={user.emergencyContact?.phone || 'Not provided'} />
                </>
              ) : (
                <>
                  <Detail label="Medical License #" value={user.medicalLicenseNumber} />
                  <Detail label="Specialization" value={user.specialization} />
                  <Detail label="Qualification" value={user.qualification} />
                  <Detail label="Experience" value={`${user.yearsOfExperience} years`} />
                  <Detail label="Consultation Fee" value={user.consultationFee ? `$${user.consultationFee}` : '-'} />
                  <Detail label="Department" value={user.department?.name || 'Unassigned'} />
                  <Detail label="Approval Status" value={user.approvalStatus} />
                </>
              )}
            </div>
          )}

          {showRejectBox && (
            <div className="mt-4 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                Reason for rejection (optional, shown to the doctor)
              </label>
              <textarea className="input-field" rows={2} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
              <div className="mt-2 flex gap-2">
                <button disabled={busy} onClick={handleReject} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700">
                  Confirm Rejection
                </button>
                <button onClick={() => setShowRejectBox(false)} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            {type === 'doctor' && user.approvalStatus === 'pending' && !showRejectBox && (
              <>
                <button disabled={busy} onClick={handleApprove} className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-200">
                  Approve
                </button>
                <button disabled={busy} onClick={() => setShowRejectBox(true)} className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200">
                  Reject
                </button>
              </>
            )}

            {editing ? (
              <>
                <button disabled={busy} onClick={handleSave} className="btn-primary px-4 py-1.5 text-xs">
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setForm(toFormShape(user));
                  }}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
                Edit Details
              </button>
            )}

            <button disabled={busy} onClick={handleDelete} className="ml-auto rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700">
              Delete Account
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
    <p className="text-slate-800 dark:text-white">{value || '-'}</p>
  </div>
);

const TextField = ({ label, ...props }) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>
    <input className="input-field" {...props} />
  </div>
);

const SelectField = ({ label, options, ...props }) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>
    <select className="input-field" {...props}>
      <option value="">Select</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

export default UserDetailPanel;
