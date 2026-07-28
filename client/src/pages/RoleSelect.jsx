import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaUserInjured, FaUserDoctor } from 'react-icons/fa6';

// Shown after the user picks Login or Sign Up. mode is 'login' | 'signup',
// passed in directly as a prop from the route definition in App.jsx.
// Admin is deliberately never offered here.
const RoleSelect = ({ mode }) => {
  const navigate = useNavigate();

  const isSignup = mode === 'signup';
  const heading = isSignup ? 'Sign up as' : 'Log in as';

  const roles = [
    {
      key: 'patient',
      label: 'Patient',
      icon: FaUserInjured,
      description: 'Book appointments, view records, and manage your health.',
    },
    {
      key: 'doctor',
      label: 'Doctor',
      icon: FaUserDoctor,
      description: 'Manage patients, appointments, and prescriptions.',
    },
  ];

  const handleSelect = (roleKey) => {
    navigate(`/${mode}/${roleKey}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <h1 className="mb-8 text-center font-display text-2xl font-bold text-slate-800 dark:text-white">
          {heading} <span className="gradient-text">City Care</span>
        </h1>

        <div className="grid gap-6 sm:grid-cols-2">
          {roles.map(({ key, label, icon: Icon, description }, i) => (
            <motion.button
              key={key}
              onClick={() => handleSelect(key)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card flex flex-col items-center gap-3 p-8 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-cyan-500">
                <Icon className="h-7 w-7 text-white" />
              </div>
              <span className="font-display text-lg font-semibold text-slate-800 dark:text-white">{label}</span>
              <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default RoleSelect;
