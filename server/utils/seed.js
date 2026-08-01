// Run with: npm run seed
// Seeds baseline departments and one admin account so you can log in
// immediately without manually inserting documents in MongoDB Atlas.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Department = require('../models/Department');
const User = require('../models/User');

const departments = [
  { name: 'General Medicine', description: 'Checkups and preventive care', icon: 'general' },
  { name: 'Cardiology', description: 'Heart health diagnostics and treatment', icon: 'cardiology' },
  { name: 'Neurology', description: 'Brain, spine and nervous system care', icon: 'neurology' },
  { name: 'Orthopedics', description: 'Bone, joint and mobility treatment', icon: 'orthopedics' },
  { name: 'Pediatrics', description: 'Care for children of all ages', icon: 'pediatrics' },
  { name: 'Dental Care', description: 'Full-service dental and oral health', icon: 'dental' },
  { name: 'Oncology', description: 'Cancer screening, diagnosis and treatment', icon: 'oncology' },
  { name: 'Nephrology', description: 'Kidney health and dialysis care', icon: 'nephrology' },
  { name: 'Psychiatry', description: 'Mental health assessment and treatment', icon: 'psychiatry' },
  { name: 'Pulmonology', description: 'Lung and respiratory system care', icon: 'pulmonology' },
  { name: 'Urology', description: 'Urinary tract and male reproductive health', icon: 'urology' },
  { name: 'Gynecology', description: "Women's reproductive health care", icon: 'gynecology' },
  { name: 'Dermatology', description: 'Skin, hair and nail conditions', icon: 'dermatology' },
  { name: 'ENT (Otolaryngology)', description: 'Ear, nose and throat care', icon: 'ent' },
  { name: 'Gastroenterology', description: 'Digestive system diagnosis and treatment', icon: 'gastroenterology' },
  { name: 'Endocrinology', description: 'Hormonal and metabolic disorders, including diabetes', icon: 'endocrinology' },
  { name: 'Ophthalmology', description: 'Complete eye care and vision correction', icon: 'ophthalmology' },
  { name: 'Emergency Medicine', description: 'Urgent and trauma care around the clock', icon: 'emergency' },
  { name: 'Radiology', description: 'Diagnostic imaging including X-ray, CT and MRI', icon: 'radiology' },
  { name: 'Physical Therapy', description: 'Rehabilitation and mobility recovery', icon: 'physiotherapy' },
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
