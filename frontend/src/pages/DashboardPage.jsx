import React from 'react';
import { useAuth } from '../hooks/useAuth.js';
import ThemeToggle from '../components/common/ThemeToggle.jsx';
import Button from '../components/common/Button.jsx';
import { LogOut, HeartPulse, User, Mail, Phone, MapPin, Calendar, Award } from 'lucide-react';

const DashboardPage = () => {
  const { user, profile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-darkBg transition-colors duration-300">
      {/* Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-primary-400/20 dark:bg-primary-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-accent-400/20 dark:bg-accent-900/10 blur-[120px] pointer-events-none" />

      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-6 py-16 relative z-20">
        {/* Header Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800 mb-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-600 dark:bg-primary-500 rounded-2xl text-white">
              <HeartPulse className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent">
                Hospital Care
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Secure Workspaces</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="md"
            onClick={handleLogout}
            className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/20 self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        {/* Welcome Section */}
        <div className="mb-10 text-left">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Welcome back, <span className="text-primary-600 dark:text-primary-400">{user?.fullName}</span>!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            You are currently logged into the portal. Here is a summary of your registration card.
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* User card profile */}
          <div className="md:col-span-1 p-6 rounded-3xl border border-white/40 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/40 glass-panel shadow-md space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-3xl mb-4 border border-slate-300 dark:border-slate-700">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-lg">{user?.fullName}</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 mt-1.5 uppercase tracking-wider">
                {user?.role}
              </span>
            </div>

            <hr className="border-slate-200 dark:border-slate-800" />

            <div className="space-y-3.5 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-3">
                <Mail className="w-4.5 h-4.5 text-slate-400" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4.5 h-4.5 text-slate-400" />
                <span>{user?.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4.5 h-4.5 text-slate-400" />
                <span>{user?.address}</span>
              </div>
            </div>
          </div>

          {/* Profile particulars card */}
          <div className="md:col-span-2 p-6 rounded-3xl border border-white/40 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/40 glass-panel shadow-md">
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mb-6">
              Account Metadata
            </h3>

            {user?.role === 'patient' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-800/40">
                    <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Blood Group</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{profile?.bloodGroup || 'Not specified'}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-800/40">
                    <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Gender</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold capitalize">{user?.gender}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-800/40">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Known Allergies</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">
                    {profile?.allergies && profile.allergies.length > 0
                      ? profile.allergies.join(', ')
                      : 'None reported'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-800/40">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Emergency Contact</span>
                  {profile?.emergencyContact?.name ? (
                    <div className="text-slate-800 dark:text-slate-200 text-sm font-semibold">
                      {profile.emergencyContact.name} ({profile.emergencyContact.relationship}) - {profile.emergencyContact.phone}
                    </div>
                  ) : (
                    <span className="text-slate-400 text-sm italic">Not configured</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-800/40 flex items-start gap-3">
                    <Award className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Specialization</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold text-sm">{profile?.specialization}</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-800/40 flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-accent-500 mt-0.5" />
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Years Experience</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold text-sm">{profile?.yearsOfExperience} Years</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-800/40">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Qualification</span>
                      <span className="text-slate-800 dark:text-slate-200 font-semibold">{profile?.qualification}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Department</span>
                      <span className="text-slate-800 dark:text-slate-200 font-semibold">{profile?.department}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-800/40">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">License Number</span>
                      <span className="text-slate-800 dark:text-slate-200 font-mono font-bold text-xs">{profile?.medicalLicenseNumber}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Consultation Fee</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">${profile?.consultationFee || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
