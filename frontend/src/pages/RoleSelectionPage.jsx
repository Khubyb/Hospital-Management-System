import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Stethoscope, ArrowLeft, ArrowRight } from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle.jsx';
import Button from '../components/common/Button.jsx';
import RoleCard from '../components/auth/RoleCard.jsx';

const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login'; // default to login

  const [selectedRole, setSelectedRole] = useState('patient'); // patient by default

  const handleContinue = () => {
    if (mode === 'signup') {
      navigate(`/signup?role=${selectedRole}`);
    } else {
      navigate(`/login?role=${selectedRole}`);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-gray-50 dark:bg-darkBg transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary-400/20 dark:bg-primary-900/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent-400/20 dark:bg-accent-900/10 blur-[120px]" />

      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-2xl flex flex-col items-center z-20">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-8 self-start transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Welcome
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
            Select Your Role
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Please choose how you wish to access the portal so we can direct you to the correct interface.
          </p>
        </motion.div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mb-10">
          <RoleCard
            role="patient"
            title="Patient"
            description="Book appointments, access health records, and message your doctors."
            icon={Heart}
            selected={selectedRole === 'patient'}
            onClick={() => setSelectedRole('patient')}
          />
          <RoleCard
            role="doctor"
            title="Doctor"
            description="Manage consult schedules, review patient files, and prescribe treatments."
            icon={Stethoscope}
            selected={selectedRole === 'doctor'}
            onClick={() => setSelectedRole('doctor')}
          />
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full flex justify-end"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={handleContinue}
            className="w-full sm:w-auto shadow-md shadow-primary-500/10 gap-2"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
