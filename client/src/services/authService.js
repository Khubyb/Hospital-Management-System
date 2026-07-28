import api from './api';

export const authService = {
  signupPatient: (data) => api.post('/auth/signup/patient', data).then((r) => r.data),
  signupDoctor: (data) => api.post('/auth/signup/doctor', data).then((r) => r.data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data).then((r) => r.data),
  resendOTP: (data) => api.post('/auth/resend-otp', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  getMe: () => api.get('/auth/me').then((r) => r.data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data).then((r) => r.data),
  resetPassword: (data) => api.post('/auth/reset-password', data).then((r) => r.data),
};

export const departmentService = {
  getAll: () => api.get('/departments').then((r) => r.data),
};

export const doctorService = {
  search: (params) => api.get('/doctors', { params }).then((r) => r.data),
  getById: (id) => api.get(`/doctors/${id}`).then((r) => r.data),
};

export const appointmentService = {
  book: (data) => api.post('/appointments', data).then((r) => r.data),
  getAll: (params) => api.get('/appointments', { params }).then((r) => r.data),
  updateStatus: (id, data) => api.patch(`/appointments/${id}/status`, data).then((r) => r.data),
  reschedule: (id, data) => api.patch(`/appointments/${id}/reschedule`, data).then((r) => r.data),
};
