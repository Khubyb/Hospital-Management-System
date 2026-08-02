import api from './api';

export const authService = {
  signupPatient: (data) => api.post('/auth/signup/patient', data).then((r) => r.data),
  signupDoctor: (data) => api.post('/auth/signup/doctor', data).then((r) => r.data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data).then((r) => r.data),
  resendOTP: (data) => api.post('/auth/resend-otp', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  getMe: () => api.get('/auth/me').then((r) => r.data),
  updateProfile: (data) => api.put('/auth/update-profile', data).then((r) => r.data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data).then((r) => r.data),
  resetPassword: (data) => api.post('/auth/reset-password', data).then((r) => r.data),
};

export const departmentService = {
  getAll: () => api.get('/departments').then((r) => r.data),
};

export const doctorService = {
  search: (params) => api.get('/doctors', { params }).then((r) => r.data),
  getById: (id) => api.get(`/doctors/${id}`).then((r) => r.data),
  getAvailableSlots: (id, date) => api.get(`/doctors/${id}/available-slots`, { params: { date } }).then((r) => r.data),
  updateAvailability: (availability) => api.put('/doctors/availability', { availability }).then((r) => r.data),
  cancelAvailabilitySlot: (day, startTime, endTime) =>
    api.patch('/doctors/availability/cancel', { day, startTime, endTime }).then((r) => r.data),
};

export const appointmentService = {
  book: (data) => api.post('/appointments', data).then((r) => r.data),
  getAll: (params) => api.get('/appointments', { params }).then((r) => r.data),
  updateStatus: (id, data) => api.patch(`/appointments/${id}/status`, data).then((r) => r.data),
  reschedule: (id, data) => api.patch(`/appointments/${id}/reschedule`, data).then((r) => r.data),
};

export const adminService = {
  getStats: () => api.get('/admin/stats').then((r) => r.data),
  getAllDoctors: () => api.get('/admin/doctors').then((r) => r.data),
  getAllPatients: () => api.get('/admin/patients').then((r) => r.data),
  getUserDetail: (id) => api.get(`/admin/users/${id}`).then((r) => r.data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data).then((r) => r.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then((r) => r.data),
  setUserActiveStatus: (id, isActive) => api.patch(`/admin/users/${id}/status`, { isActive }).then((r) => r.data),
  approveDoctor: (id) => api.patch(`/doctors/${id}/approve`).then((r) => r.data),
  rejectDoctor: (id, reason) => api.patch(`/doctors/${id}/reject`, { reason }).then((r) => r.data),
};
