import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaHeartPulse,
  FaUserDoctor,
  FaStethoscope,
  FaTooth,
  FaBrain,
  FaBone,
  FaBaby,
  FaRibbon,
  FaDroplet,
  FaLungs,
  FaVenus,
  FaHandDots,
  FaEarListen,
  FaPills,
  FaVial,
  FaEye,
  FaTruckMedical,
  FaXRay,
  FaDumbbell,
  FaStar,
} from 'react-icons/fa6';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';
import { departmentService } from '../services/authService';

// Maps each department's stored `icon` key to an actual icon component.
// Falls back to a generic stethoscope icon for anything unrecognized.
const ICON_MAP = {
  general: FaStethoscope,
  cardiology: FaHeartPulse,
  neurology: FaBrain,
  orthopedics: FaBone,
  pediatrics: FaBaby,
  dental: FaTooth,
  oncology: FaRibbon,
  nephrology: FaDroplet,
  psychiatry: FaBrain,
  pulmonology: FaLungs,
  urology: FaDroplet,
  gynecology: FaVenus,
  dermatology: FaHandDots,
  ent: FaEarListen,
  gastroenterology: FaPills,
  endocrinology: FaVial,
  ophthalmology: FaEye,
  emergency: FaTruckMedical,
  radiology: FaXRay,
  physiotherapy: FaDumbbell,
};

const statsBase = [
  { label: 'Patients Served', value: '25,000+' },
  { label: 'Expert Doctors', value: '180+' },
  { label: 'Years of Care', value: '10+' },
];

const faqs = [
  { q: 'How do I book an appointment?', a: 'Sign up as a patient, search for a doctor by department or specialty, and choose an open time slot.' },
  { q: 'Can I reschedule or cancel?', a: 'Yes — both options are available from your patient dashboard until the appointment is completed.' },
  { q: 'Is my medical data secure?', a: 'Yes. We use encrypted passwords, secure cookies, and role-based access control throughout the platform.' },
];

const Landing = () => {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    departmentService
      .getAll()
      .then((res) => setDepartments(res.departments || []))
      .catch(() => setDepartments([]));
  }, []);

  const stats = [
    ...statsBase.slice(0, 2),
    { label: 'Departments', value: '5+' },
    statsBase[2],
  ];

  return (
    <div className="overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-slate-100 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-cyan-500">
              <FaHeartPulse className="text-white" />
            </div>
            <span className="font-display text-lg font-bold text-slate-800 dark:text-white">HMS</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/welcome" className="btn-primary !px-5 !py-2 text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 py-24 text-center">
        <FaHeartPulse className="absolute left-[10%] top-24 h-14 w-14 text-primary-200 dark:text-slate-800 animate-float" />
        <FaStethoscope
          className="absolute right-[12%] top-40 h-16 w-16 text-cyan-200 dark:text-slate-800 animate-float"
          style={{ animationDelay: '1s' }}
        />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <h1 className="mx-auto max-w-3xl font-display text-4xl font-extrabold leading-tight text-slate-800 dark:text-white sm:text-5xl">
            Healthcare that moves <span className="gradient-text">as fast as you need it to.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-slate-500 dark:text-slate-400">
            Book appointments, consult top specialists, and manage your medical records — all from one secure
            platform.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/welcome" className="btn-primary">
              Book an Appointment
            </Link>
            <Link to="/welcome" className="btn-outline">
              Find a Doctor
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-6 pb-20 sm:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 text-center"
          >
            <p className="font-display text-3xl font-extrabold gradient-text">{s.value}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
          </motion.div>
        ))}
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="mb-10 text-center font-display text-3xl font-bold text-slate-800 dark:text-white">
          Our Departments
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map(({ _id, name, description, icon }, i) => {
            const Icon = ICON_MAP[icon] || FaStethoscope;
            return (
              <motion.div
                key={_id || name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -6 }}
                className="glass-card p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-cyan-500">
                  <Icon className="text-white" />
                </div>
                <h3 className="font-display text-lg font-semibold text-slate-800 dark:text-white">{name}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Testimonial */}
      <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
        <div className="glass-card p-10">
          <div className="mb-4 flex justify-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} />
            ))}
          </div>
          <p className="text-lg italic text-slate-600 dark:text-slate-300">
            "Booking an appointment took less than two minutes, and I could track everything from my dashboard."
          </p>
          <p className="mt-4 text-sm font-semibold text-slate-800 dark:text-white">— A Hospital Management System Patient</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <h2 className="mb-8 text-center font-display text-3xl font-bold text-slate-800 dark:text-white">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((f) => (
            <details key={f.q} className="glass-card group p-5">
              <summary className="cursor-pointer list-none font-medium text-slate-800 dark:text-white">
                {f.q}
              </summary>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        © {new Date().getFullYear()} Hospital Management System. Built as a MERN portfolio project.
      </footer>
    </div>
  );
};

export default Landing;
