// Run with: npm run seed
// Seeds baseline departments and one admin account so you can log in
// immediately without manually inserting documents in MongoDB Atlas.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Department = require('../models/Department');
const User = require('../models/User');

const departments = [
  { name: 'General Medicine', description: 'Checkups and preventive care', icon: 'stethoscope' },
  { name: 'Cardiology', description: 'Heart health diagnostics and treatment', icon: 'heart-pulse' },
  { name: 'Neurology', description: 'Brain, spine and nervous system care', icon: 'brain' },
  { name: 'Orthopedics', description: 'Bone, joint and mobility treatment', icon: 'bone' },
  { name: 'Pediatrics', description: 'Care for children of all ages', icon: 'child' },
  { name: 'Dental Care', description: 'Full-service dental and oral health', icon: 'tooth' },
];

const seed = async () => {
  await connectDB();

  console.log('Seeding departments...');
  for (const dept of departments) {
    await Department.findOneAndUpdate({ name: dept.name }, dept, { upsert: true, new: true });
  }

  console.log('Seeding default admin account...');
  const adminEmail = 'admin@citycare.com';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      fullName: 'System Administrator',
      email: adminEmail,
      password: 'Admin@12345', // CHANGE THIS after first login
      phone: '+10000000000',
      role: 'admin',
      isEmailVerified: true,
      acceptedTerms: true,
    });
    console.log(`Admin created -> email: ${adminEmail} | password: Admin@12345 (change this immediately)`);
  } else {
    console.log('Admin account already exists, skipping.');
  }

  console.log('Seeding complete.');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
