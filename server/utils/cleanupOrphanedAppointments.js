// One-time cleanup for appointments created before deleteUser started
// cascade-deleting appointments (see adminController.deleteUser). These are
// appointments whose doctor or patient account was already deleted, so they
// show up as broken "Dr. " / nameless cards on dashboards.
//
// Run once with:  node utils/cleanupOrphanedAppointments.js
// Safe to run more than once — it's a no-op if there's nothing orphaned left.

require('dotenv').config();
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Scanning for orphaned appointments...');

  const appointments = await Appointment.find().select('doctor patient');
  const doctorIds = [...new Set(appointments.map((a) => String(a.doctor)))];
  const patientIds = [...new Set(appointments.map((a) => String(a.patient)))];

  const existingUserIds = new Set(
    (await User.find({ _id: { $in: [...doctorIds, ...patientIds] } }).select('_id')).map((u) => String(u._id))
  );

  const orphanedIds = appointments
    .filter((a) => !existingUserIds.has(String(a.doctor)) || !existingUserIds.has(String(a.patient)))
    .map((a) => a._id);

  if (orphanedIds.length === 0) {
    console.log('No orphaned appointments found. Nothing to clean up.');
  } else {
    const result = await Appointment.deleteMany({ _id: { $in: orphanedIds } });
    console.log(`Deleted ${result.deletedCount} orphaned appointment(s).`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Cleanup failed:', err.message);
  process.exit(1);
});
