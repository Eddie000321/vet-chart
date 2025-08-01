const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Add a root route for testing
app.get('/', (req, res) => {
  res.json({ message: 'VetChart EMR Server is running', status: 'OK' });
});

// In-memory database
const db = {
  users: [],
  owners: [],
  patients: [],
  medical_records: [],
  appointments: []
};

// Initialize database with default data
const initDB = async () => {
  try {
    // Create default users
    const hashedPassword = bcrypt.hashSync('password', 10);
    
    db.users.push({
      id: uuidv4(),
      username: 'admin',
      email: 'admin@vetchart.com',
      password: hashedPassword,
      firstName: 'J',
      lastName: 'Han',
      roles: ['veterinarian', 'admin'],
      createdAt: new Date().toISOString()
    });
    
    db.users.push({
      id: uuidv4(),
      username: 'staff',
      email: 'staff@vetchart.com',
      password: hashedPassword,
      firstName: 'J',
      lastName: 'Lee',
      roles: ['staff'],
      createdAt: new Date().toISOString()
    });
    
    db.users.push({
      id: uuidv4(),
      username: 'vet',
      email: 'vet@vetchart.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Wilson',
      roles: ['veterinarian'],
      createdAt: new Date().toISOString()
    });
    
    // Create example owners
    const owner1Id = uuidv4();
    const owner2Id = uuidv4();
    const owner3Id = uuidv4();
    const owner4Id = uuidv4();
    const owner5Id = uuidv4();
    
    db.owners.push({
      id: owner1Id,
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(555) 123-4567',
      address: '123 Oak Street, Springfield, IL 62701',
      notes: 'Prefers morning appointments. Has two dogs and one cat. Very attentive pet owner.',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
    });
    
    db.owners.push({
      id: owner2Id,
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@email.com',
      phone: '(555) 234-5678',
      address: '456 Pine Avenue, Springfield, IL 62702',
      notes: 'Works late hours, prefers evening appointments. Very knowledgeable about pet care.',
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() // 25 days ago
    });
    
    db.owners.push({
      id: owner3Id,
      firstName: 'Emily',
      lastName: 'Rodriguez',
      email: 'emily.rodriguez@email.com',
      phone: '(555) 345-6789',
      address: '789 Maple Drive, Springfield, IL 62703',
      notes: 'First-time pet owner. Needs extra guidance and reassurance during visits.',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() // 20 days ago
    });
    
    db.owners.push({
      id: owner4Id,
      firstName: 'David',
      lastName: 'Thompson',
      email: 'david.thompson@email.com',
      phone: '(555) 456-7890',
      address: '321 Elm Street, Springfield, IL 62704',
      notes: 'Travels frequently for work. Emergency contact is his neighbor Mrs. Smith (555) 999-1234.',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days ago
    });
    
    db.owners.push({
      id: owner5Id,
      firstName: 'Lisa',
      lastName: 'Anderson',
      email: 'lisa.anderson@email.com',
      phone: '(555) 567-8901',
      address: '654 Cedar Lane, Springfield, IL 62705',
      notes: 'Senior citizen, may need assistance with pet handling. Very caring and dedicated owner.',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
    });
    
    // Additional owners for more comprehensive data
    const owner6Id = uuidv4();
    const owner7Id = uuidv4();
    const owner8Id = uuidv4();
    const owner9Id = uuidv4();
    const owner10Id = uuidv4();
    const owner11Id = uuidv4();
    const owner12Id = uuidv4();
    
    db.owners.push({
      id: owner6Id,
      firstName: 'Robert',
      lastName: 'Martinez',
      email: 'robert.martinez@email.com',
      phone: '(555) 678-9012',
      address: '987 Birch Street, Springfield, IL 62706',
      notes: 'Works from home, very flexible with appointment times. Has experience with multiple pets.',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.owners.push({
      id: owner7Id,
      firstName: 'Jennifer',
      lastName: 'Taylor',
      email: 'jennifer.taylor@email.com',
      phone: '(555) 789-0123',
      address: '246 Willow Avenue, Springfield, IL 62707',
      notes: 'Veterinary technician at another clinic. Very knowledgeable about pet care and medications.',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.owners.push({
      id: owner8Id,
      firstName: 'Mark',
      lastName: 'Williams',
      email: 'mark.williams@email.com',
      phone: '(555) 890-1234',
      address: '135 Spruce Road, Springfield, IL 62708',
      notes: 'Recently moved from another state. Previous vet records available upon request.',
      createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.owners.push({
      id: owner9Id,
      firstName: 'Amanda',
      lastName: 'Davis',
      email: 'amanda.davis@email.com',
      phone: '(555) 901-2345',
      address: '579 Poplar Drive, Springfield, IL 62709',
      notes: 'College student, limited budget. Interested in payment plans and preventive care packages.',
      createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.owners.push({
      id: owner10Id,
      firstName: 'Christopher',
      lastName: 'Brown',
      email: 'christopher.brown@email.com',
      phone: '(555) 012-3456',
      address: '864 Hickory Lane, Springfield, IL 62710',
      notes: 'Breeder with multiple animals. Requires group appointment scheduling and bulk services.',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.owners.push({
      id: owner11Id,
      firstName: 'Nicole',
      lastName: 'Garcia',
      email: 'nicole.garcia@email.com',
      phone: '(555) 123-4567',
      address: '753 Magnolia Street, Springfield, IL 62711',
      notes: 'Rescue volunteer, often brings in stray animals. Very compassionate and dedicated to animal welfare.',
      createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.owners.push({
      id: owner12Id,
      firstName: 'Kevin',
      lastName: 'Wilson',
      email: 'kevin.wilson@email.com',
      phone: '(555) 234-5678',
      address: '642 Sycamore Avenue, Springfield, IL 62712',
      notes: 'Elderly gentleman with mobility issues. May need assistance getting pets in/out of car.',
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    // Create example patients
    const patient1Id = uuidv4();
    const patient2Id = uuidv4();
    const patient3Id = uuidv4();
    const patient4Id = uuidv4();
    const patient5Id = uuidv4();
    const patient6Id = uuidv4();
    const patient7Id = uuidv4();
    
    db.patients.push({
      id: patient1Id,
      name: 'Buddy',
      species: 'Dog',
      breed: 'Golden Retriever',
      age: 5,
      gender: 'Male',
      weight: 65,
      weightUnit: 'lbs',
      ownerId: owner1Id,
      assignedDoctor: 'J Han',
      handlingDifficulty: 'easy',
      createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.patients.push({
      id: patient2Id,
      name: 'Whiskers',
      species: 'Cat',
      breed: 'Persian',
      age: 3,
      gender: 'Female',
      weight: 8,
      weightUnit: 'lbs',
      ownerId: owner1Id,
      assignedDoctor: 'J Lee',
      handlingDifficulty: 'medium',
      createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.patients.push({
      id: patient3Id,
      name: 'Max',
      species: 'Dog',
      breed: 'German Shepherd',
      age: 7,
      gender: 'Male',
      weight: 75,
      weightUnit: 'lbs',
      ownerId: owner2Id,
      assignedDoctor: 'J Han',
      handlingDifficulty: 'hard',
      createdAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.patients.push({
      id: patient4Id,
      name: 'Luna',
      species: 'Cat',
      breed: 'Siamese',
      age: 2,
      gender: 'Female',
      weight: 7,
      weightUnit: 'lbs',
      ownerId: owner3Id,
      assignedDoctor: 'Sarah Wilson',
      handlingDifficulty: 'easy',
      createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.patients.push({
      id: patient5Id,
      name: 'Charlie',
      species: 'Dog',
      breed: 'Labrador',
      age: 4,
      gender: 'Male',
      weight: 70,
      weightUnit: 'lbs',
      ownerId: owner4Id,
      assignedDoctor: 'J Lee',
      handlingDifficulty: 'medium',
      createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.patients.push({
      id: patient6Id,
      name: 'Bella',
      species: 'Dog',
      breed: 'Poodle',
      age: 6,
      gender: 'Female',
      weight: 45,
      weightUnit: 'lbs',
      ownerId: owner5Id,
      assignedDoctor: 'Michael Brown',
      handlingDifficulty: 'easy',
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.patients.push({
      id: patient7Id,
      name: 'Tweety',
      species: 'Bird',
      breed: 'Canary',
      age: 1,
      gender: 'Male',
      weight: 0.5,
      weightUnit: 'lbs',
      ownerId: owner3Id,
      assignedDoctor: 'Sarah Wilson',
      handlingDifficulty: 'hard',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    // Additional patients for more comprehensive data
    const patient8Id = uuidv4();
    const patient9Id = uuidv4();
    const patient10Id = uuidv4();
    const patient11Id = uuidv4();
    const patient12Id = uuidv4();
    const patient13Id = uuidv4();
    const patient14Id = uuidv4();
    const patient15Id = uuidv4();
    const patient16Id = uuidv4();
    const patient17Id = uuidv4();
    const patient18Id = uuidv4();
    const patient19Id = uuidv4();
    const patient20Id = uuidv4();
    
    db.patients.push({
      id: patient8Id,
      name: 'Rocky',
      species: 'Dog',
      breed: 'Bulldog',
      age: 3,
      gender: 'Male',
      weight: 50,
      weightUnit: 'lbs',
      ownerId: owner6Id,
      assignedDoctor: 'J Han',
      handlingDifficulty: 'medium',
      status: 'active',
      createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.patients.push({
      id: patient9Id,
      name: 'Mittens',
      species: 'Cat',
      breed: 'Maine Coon',
      age: 6,
      gender: 'Female',
      weight: 12,
      weightUnit: 'lbs',
      ownerId: owner6Id,
      assignedDoctor: 'J Lee',
      handlingDifficulty: 'easy',
      status: 'active',
      createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.patients.push({
      id: patient10Id,
      name: 'Spike',
      species: 'Dog',
      breed: 'Rottweiler',
      age: 8,
      gender: 'Male',
      weight: 110,
      weightUnit: 'lbs',
      ownerId: owner7Id,
      assignedDoctor: 'Michael Brown',
      handlingDifficulty: 'hard',
      status: 'active',
      createdAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.patients.push({
      id: patient11Id,
      name: 'Princess',
      species: 'Cat',
      breed: 'Ragdoll',
      age: 4,
      gender: 'Female',
      weight: 10,
      weightUnit: 'lbs',
      ownerId: owner8Id,
      assignedDoctor: 'Sarah Wilson',
      handlingDifficulty: 'easy',
      status: 'active',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.patients.push({
      id: patient12Id,
      name: 'Gizmo',
      species: 'Hamster',
      breed: 'Syrian Hamster',
      age: 1,
      gender: 'Male',
      weight: 0.3,
      weightUnit: 'lbs',
      ownerId: owner9Id,
      assignedDoctor: 'Sarah Wilson',
      handlingDifficulty: 'medium',
      status: 'active',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.patients.push({
      id: patient13Id,
      name: 'Nemo',
      species: 'Fish',
      breed: 'Goldfish',
      age: 2,
      gender: 'Male',
      weight: 0.1,
      weightUnit: 'lbs',
      ownerId: owner9Id,
      assignedDoctor: 'Sarah Wilson',
      handlingDifficulty: 'easy',
      status: 'active',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.patients.push({
      id: patient14Id,
      name: 'Rex',
      species: 'Dog',
      breed: 'German Shepherd',
      age: 5,
      gender: 'Male',
      weight: 80,
      weightUnit: 'lbs',
      ownerId: owner10Id,
      assignedDoctor: 'J Han',
      handlingDifficulty: 'medium',
      status: 'active',
      createdAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.patients.push({
      id: patient15Id,
      name: 'Duchess',
      species: 'Dog',
      breed: 'Poodle',
      age: 7,
      gender: 'Female',
      weight: 55,
      weightUnit: 'lbs',
      ownerId: owner10Id,
      assignedDoctor: 'J Lee',
      handlingDifficulty: 'easy',
      status: 'active',
      createdAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.patients.push({
      id: patient16Id,
      name: 'Shadow',
      species: 'Cat',
      breed: 'Black Cat',
      age: 3,
      gender: 'Male',
      weight: 9,
      weightUnit: 'lbs',
      ownerId: owner11Id,
      assignedDoctor: 'J Han',
      handlingDifficulty: 'medium',
      status: 'active',
      createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.patients.push({
      id: patient17Id,
      name: 'Snowball',
      species: 'Rabbit',
      breed: 'Holland Lop',
      age: 2,
      gender: 'Female',
      weight: 3,
      weightUnit: 'lbs',
      ownerId: owner11Id,
      assignedDoctor: 'Sarah Wilson',
      handlingDifficulty: 'easy',
      status: 'active',
      createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.patients.push({
      id: patient18Id,
      name: 'Oscar',
      species: 'Dog',
      breed: 'Beagle',
      age: 9,
      gender: 'Male',
      weight: 30,
      weightUnit: 'lbs',
      ownerId: owner12Id,
      assignedDoctor: 'Michael Brown',
      handlingDifficulty: 'easy',
      status: 'active',
      createdAt: new Date(Date.now() - 115 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.patients.push({
      id: patient19Id,
      name: 'Cleo',
      species: 'Reptile',
      breed: 'Bearded Dragon',
      age: 4,
      gender: 'Female',
      weight: 1,
      weightUnit: 'lbs',
      ownerId: owner8Id,
      assignedDoctor: 'Sarah Wilson',
      handlingDifficulty: 'hard',
      status: 'active',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.patients.push({
      id: patient20Id,
      name: 'Buster',
      species: 'Dog',
      breed: 'Jack Russell Terrier',
      age: 12,
      gender: 'Male',
      weight: 18,
      weightUnit: 'lbs',
      ownerId: owner12Id,
      assignedDoctor: 'J Lee',
      handlingDifficulty: 'medium',
      status: 'inactive',
      createdAt: new Date(Date.now() - 115 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    // Create example medical records
    db.medical_records.push({
      id: uuidv4(),
      patientId: patient1Id,
      visitDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
      recordType: 'treatment',
      symptoms: 'Limping on right front leg, reluctant to play, whimpering when walking',
      diagnosis: 'Mild sprain in right front paw, likely from overexertion during play',
      treatment: 'Rest for 1 week, anti-inflammatory medication (Rimadyl 75mg twice daily), cold compress 10 minutes 3x daily',
      notes: 'Owner reports dog was playing fetch vigorously yesterday. Recommend limiting activity and follow-up in 1 week.',
      veterinarian: 'J Han',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.medical_records.push({
      id: uuidv4(),
      patientId: patient2Id,
      visitDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days ago
      recordType: 'treatment',
      symptoms: 'Excessive scratching, hair loss around ears, red irritated skin',
      diagnosis: 'Ear mites and secondary bacterial infection',
      treatment: 'Ear cleaning solution, antibiotic ear drops (Otomax) twice daily for 10 days, Elizabethan collar to prevent scratching',
      notes: 'Microscopic examination confirmed ear mites. Owner educated on proper ear cleaning technique.',
      veterinarian: 'J Han',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.medical_records.push({
      id: uuidv4(),
      patientId: patient3Id,
      visitDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 21 days ago
      recordType: 'vaccine',
      symptoms: 'Annual wellness check, vaccinations due, appears healthy and active',
      diagnosis: 'Healthy adult dog, good body condition, all vital signs normal',
      treatment: 'DHPP booster vaccination, rabies vaccination, heartworm prevention (Heartgard Plus), flea/tick prevention',
      notes: 'Weight stable at 75lbs. Dental health good. Recommended annual dental cleaning. Next visit in 12 months.',
      veterinarian: 'J Lee',
      createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.medical_records.push({
      id: uuidv4(),
      patientId: patient4Id,
      visitDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
      recordType: 'treatment',
      symptoms: 'Vomiting for 2 days, decreased appetite, lethargic behavior',
      diagnosis: 'Gastroenteritis, likely dietary indiscretion',
      treatment: 'Bland diet (boiled chicken and rice) for 3 days, probiotics, anti-nausea medication (Cerenia), monitor hydration',
      notes: 'Owner reports cat got into garbage. Symptoms improving. Recheck if not resolved in 48 hours.',
      veterinarian: 'J Han',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.medical_records.push({
      id: uuidv4(),
      patientId: patient5Id,
      visitDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day ago
      recordType: 'surgery',
      symptoms: 'Routine spay surgery, pre-operative examination',
      diagnosis: 'Healthy young female dog, cleared for elective surgery',
      treatment: 'Ovariohysterectomy performed successfully, post-operative pain management, Elizabethan collar, activity restriction',
      notes: 'Surgery completed without complications. Suture removal in 10-14 days. Owner given post-op care instructions.',
      veterinarian: 'J Lee',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    // Additional medical records for comprehensive data
    db.medical_records.push({
      id: uuidv4(),
      patientId: patient8Id,
      visitDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      recordType: 'treatment',
      symptoms: 'Difficulty breathing, snoring loudly, exercise intolerance',
      diagnosis: 'Brachycephalic Obstructive Airway Syndrome (BOAS)',
      treatment: 'Weight management plan, avoid overheating, consider surgical correction if symptoms worsen',
      notes: 'Typical for bulldog breed. Owner educated on breed-specific respiratory issues.',
      veterinarian: 'J Han',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.medical_records.push({
      id: uuidv4(),
      patientId: patient9Id,
      visitDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      recordType: 'dental',
      symptoms: 'Bad breath, tartar buildup, difficulty eating hard food',
      diagnosis: 'Periodontal disease, grade 2',
      treatment: 'Professional dental cleaning under anesthesia, tooth extraction (2 molars), antibiotics, dental care instructions',
      notes: 'Owner advised on daily dental care routine. Recheck in 6 months.',
      veterinarian: 'J Lee',
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.medical_records.push({
      id: uuidv4(),
      patientId: patient10Id,
      visitDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      recordType: 'treatment',
      symptoms: 'Limping on left hind leg, swelling around knee joint, reluctant to climb stairs',
      diagnosis: 'Cranial cruciate ligament rupture',
      treatment: 'Surgical repair scheduled, pain management (Tramadol), strict rest, physical therapy post-surgery',
      notes: 'Large breed dog, common injury. Surgery successful. 8-week recovery period.',
      veterinarian: 'Michael Brown',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.medical_records.push({
      id: uuidv4(),
      patientId: patient11Id,
      visitDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      recordType: 'vaccine',
      symptoms: 'Annual wellness examination, vaccinations due',
      diagnosis: 'Healthy adult cat, slight overweight condition',
      treatment: 'FVRCP booster, rabies vaccination, weight management diet recommended',
      notes: 'Weight: 10lbs (ideal 8-9lbs). Diet plan provided. Very calm during examination.',
      veterinarian: 'Sarah Wilson',
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.medical_records.push({
      id: uuidv4(),
      patientId: patient12Id,
      visitDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      recordType: 'treatment',
      symptoms: 'Wet tail, diarrhea, lethargy, decreased appetite',
      diagnosis: 'Proliferative ileitis (wet tail disease)',
      treatment: 'Antibiotics (Enrofloxacin), probiotics, supportive care, isolation from other hamsters',
      notes: 'Common in young hamsters. Owner educated on proper hygiene and cage cleaning.',
      veterinarian: 'Sarah Wilson',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.medical_records.push({
      id: uuidv4(),
      patientId: patient14Id,
      visitDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      recordType: 'treatment',
      symptoms: 'Excessive scratching, red inflamed skin, hair loss on flanks',
      diagnosis: 'Atopic dermatitis, environmental allergies',
      treatment: 'Antihistamines, medicated shampoo, hypoallergenic diet trial, environmental management',
      notes: 'Allergy testing recommended. Seasonal pattern noted. Good response to treatment.',
      veterinarian: 'J Han',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.medical_records.push({
      id: uuidv4(),
      patientId: patient16Id,
      visitDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      recordType: 'surgery',
      symptoms: 'Routine neuter surgery, pre-operative examination',
      diagnosis: 'Healthy young male cat, cleared for surgery',
      treatment: 'Castration performed successfully, post-operative monitoring, pain management',
      notes: 'Surgery without complications. Elizabethan collar for 7 days. Suture check in 10 days.',
      veterinarian: 'J Han',
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.medical_records.push({
      id: uuidv4(),
      patientId: patient18Id,
      visitDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      recordType: 'treatment',
      symptoms: 'Increased thirst and urination, weight loss despite good appetite',
      diagnosis: 'Diabetes mellitus',
      treatment: 'Insulin therapy (Vetsulin), dietary management, blood glucose monitoring',
      notes: 'Senior dog, well-controlled with treatment. Owner trained on insulin administration.',
      veterinarian: 'Michael Brown',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.medical_records.push({
      id: uuidv4(),
      patientId: patient19Id,
      visitDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      recordType: 'treatment',
      symptoms: 'Lethargy, loss of appetite, dark coloration',
      diagnosis: 'Impaction, inadequate UVB lighting',
      treatment: 'Warm baths, dietary adjustment, proper UVB lighting setup, calcium supplementation',
      notes: 'Husbandry issues addressed. Owner educated on proper reptile care requirements.',
      veterinarian: 'Sarah Wilson',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    // Create example appointments
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    
    db.appointments.push({
      id: uuidv4(),
      patientId: patient1Id,
      date: today.toISOString().split('T')[0],
      time: '09:00',
      duration: 30,
      reason: 'Follow-up examination for paw sprain, check healing progress',
      status: 'scheduled',
      notes: 'Recheck right front paw mobility and pain level',
      veterinarian: 'J Han',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.appointments.push({
      id: uuidv4(),
      patientId: patient6Id,
      date: today.toISOString().split('T')[0],
      time: '10:30',
      duration: 60,
      reason: 'Annual wellness examination and vaccinations',
      status: 'scheduled',
      notes: 'Due for DHPP and rabies boosters, dental examination needed',
      veterinarian: 'J Lee',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.appointments.push({
      id: uuidv4(),
      patientId: patient2Id,
      date: today.toISOString().split('T')[0],
      time: '14:00',
      duration: 30,
      reason: 'Ear recheck after mite treatment, assess healing',
      status: 'scheduled',
      notes: 'Check ear canal for mites and infection resolution',
      veterinarian: 'J Han',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.appointments.push({
      id: uuidv4(),
      patientId: patient7Id,
      date: tomorrow.toISOString().split('T')[0],
      time: '11:00',
      duration: 30,
      reason: 'New patient examination and health assessment',
      status: 'scheduled',
      notes: 'First visit for young canary, general health check',
      veterinarian: 'J Lee',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.appointments.push({
      id: uuidv4(),
      patientId: patient5Id,
      date: dayAfterTomorrow.toISOString().split('T')[0],
      time: '15:30',
      duration: 30,
      reason: 'Post-operative suture removal after spay surgery',
      status: 'scheduled',
      notes: 'Remove sutures, check incision healing, clear for normal activity',
      veterinarian: 'J Lee',
      createdAt: new Date().toISOString()
    });
    
    // Add some completed appointments from the past
    db.appointments.push({
      id: uuidv4(),
      patientId: patient3Id,
      date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '10:00',
      duration: 60,
      reason: 'Annual wellness examination and vaccinations',
      status: 'completed',
      notes: 'Completed annual exam, all vaccinations up to date',
      veterinarian: 'J Lee',
      createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.appointments.push({
      id: uuidv4(),
      patientId: patient4Id,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '16:00',
      duration: 30,
      reason: 'Sick visit for vomiting and lethargy',
      status: 'completed',
      notes: 'Diagnosed with gastroenteritis, treatment plan provided',
      veterinarian: 'J Han',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    // Additional appointments for comprehensive data
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    // Today's appointments
    db.appointments.push({
      id: uuidv4(),
      patientId: patient8Id,
      date: today.toISOString().split('T')[0],
      time: '11:30',
      duration: 30,
      reason: 'Follow-up for breathing issues, weight check',
      status: 'scheduled',
      notes: 'Monitor respiratory symptoms, discuss weight management progress',
      veterinarian: 'J Han',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.appointments.push({
      id: uuidv4(),
      patientId: patient12Id,
      date: today.toISOString().split('T')[0],
      time: '15:00',
      duration: 30,
      reason: 'Recheck after wet tail treatment',
      status: 'scheduled',
      notes: 'Assess recovery from proliferative ileitis',
      veterinarian: 'Sarah Wilson',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    // Tomorrow's appointments
    db.appointments.push({
      id: uuidv4(),
      patientId: patient9Id,
      date: tomorrow.toISOString().split('T')[0],
      time: '09:30',
      duration: 60,
      reason: 'Dental cleaning follow-up and oral examination',
      status: 'scheduled',
      notes: 'Check healing after tooth extractions, assess oral health',
      veterinarian: 'J Lee',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.appointments.push({
      id: uuidv4(),
      patientId: patient11Id,
      date: tomorrow.toISOString().split('T')[0],
      time: '14:30',
      duration: 30,
      reason: 'Weight management consultation and diet adjustment',
      status: 'scheduled',
      notes: 'Evaluate weight loss progress, adjust diet plan if needed',
      veterinarian: 'Sarah Wilson',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    // Day after tomorrow
    db.appointments.push({
      id: uuidv4(),
      patientId: patient14Id,
      date: dayAfterTomorrow.toISOString().split('T')[0],
      time: '10:00',
      duration: 45,
      reason: 'Allergy testing and treatment plan review',
      status: 'scheduled',
      notes: 'Discuss allergy test results, adjust treatment protocol',
      veterinarian: 'J Han',
      createdAt: new Date().toISOString()
    });
    
    db.appointments.push({
      id: uuidv4(),
      patientId: patient16Id,
      date: dayAfterTomorrow.toISOString().split('T')[0],
      time: '16:30',
      duration: 30,
      reason: 'Post-surgical suture removal',
      status: 'scheduled',
      notes: 'Remove sutures from neuter surgery, check incision healing',
      veterinarian: 'J Han',
      createdAt: new Date().toISOString()
    });
    
    // Next week appointments
    db.appointments.push({
      id: uuidv4(),
      patientId: patient18Id,
      date: nextWeek.toISOString().split('T')[0],
      time: '09:00',
      duration: 30,
      reason: 'Diabetes management check, blood glucose monitoring',
      status: 'scheduled',
      notes: 'Review insulin dosage, check blood sugar levels',
      veterinarian: 'Michael Brown',
      createdAt: new Date().toISOString()
    });
    
    db.appointments.push({
      id: uuidv4(),
      patientId: patient19Id,
      date: nextWeek.toISOString().split('T')[0],
      time: '11:00',
      duration: 45,
      reason: 'Reptile wellness examination and husbandry review',
      status: 'scheduled',
      notes: 'Assess recovery from impaction, review habitat setup',
      veterinarian: 'Sarah Wilson',
      createdAt: new Date().toISOString()
    });
    
    // Past appointments (completed)
    db.appointments.push({
      id: uuidv4(),
      patientId: patient10Id,
      date: lastWeek.toISOString().split('T')[0],
      time: '13:00',
      duration: 90,
      reason: 'Cruciate ligament surgery',
      status: 'completed',
      notes: 'Surgery successful, post-op instructions given',
      veterinarian: 'Michael Brown',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    db.appointments.push({
      id: uuidv4(),
      patientId: patient15Id,
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '10:30',
      duration: 60,
      reason: 'Annual wellness examination and vaccinations',
      status: 'completed',
      notes: 'All vaccinations up to date, excellent health',
      veterinarian: 'J Lee',
      createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    // Cancelled appointments
    db.appointments.push({
      id: uuidv4(),
      patientId: patient17Id,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '14:00',
      duration: 30,
      reason: 'Routine check-up and nail trimming',
      status: 'cancelled',
      notes: 'Owner cancelled due to scheduling conflict',
      veterinarian: 'Sarah Wilson',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    // No-show appointments
    db.appointments.push({
      id: uuidv4(),
      patientId: patient20Id,
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '15:30',
      duration: 30,
      reason: 'Senior wellness examination',
      status: 'no-show',
      notes: 'Patient did not show up for appointment',
      veterinarian: 'J Lee',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = db.users.find(u => u.email === username);
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, roles: user.roles },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Owner routes
app.get('/api/owners', authenticateToken, async (req, res) => {
  try {
    const owners = db.owners.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(owners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/owners', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address, notes } = req.body;
    
    const newOwner = {
      id: uuidv4(),
      firstName,
      lastName,
      email,
      phone,
      address,
      notes: notes || '',
      createdAt: new Date().toISOString()
    };
    
    db.owners.push(newOwner);
    res.status(201).json(newOwner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/owners/:id', authenticateToken, async (req, res) => {
  try {
    const owner = db.owners.find(o => o.id === req.params.id);
    
    if (!owner) {
      return res.status(404).json({ error: 'Owner not found' });
    }
    res.json(owner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/owners/:id', authenticateToken, async (req, res) => {
  try {
    const ownerId = req.params.id;
    const ownerIndex = db.owners.findIndex(o => o.id === ownerId);
    
    if (ownerIndex === -1) {
      return res.status(404).json({ error: 'Owner not found' });
    }
    
    // Check if owner has any patients
    const hasPatients = db.patients.some(p => p.ownerId === ownerId);
    if (hasPatients) {
      return res.status(400).json({ error: 'Cannot delete owner with existing patients' });
    }
    
    db.owners.splice(ownerIndex, 1);
    res.json({ message: 'Owner deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/owners/:id', authenticateToken, async (req, res) => {
  try {
    const ownerId = req.params.id;
    const { firstName, lastName, email, phone, address, notes } = req.body;
    
    const ownerIndex = db.owners.findIndex(o => o.id === ownerId);
    
    if (ownerIndex === -1) {
      return res.status(404).json({ error: 'Owner not found' });
    }
    
    const updatedOwner = {
      ...db.owners[ownerIndex],
      firstName,
      lastName,
      email,
      phone,
      address,
      notes: notes || ''
    };
    
    db.owners[ownerIndex] = updatedOwner;
    res.json(updatedOwner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Patient routes
app.get('/api/patients', authenticateToken, async (req, res) => {
  try {
    const patientsWithOwners = db.patients.map(patient => {
      const owner = db.owners.find(o => o.id === patient.ownerId);
      return {
        ...patient,
        owner: owner || null
      };
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(patientsWithOwners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/patients', authenticateToken, async (req, res) => {
  try {
    const { name, species, breed, age, gender, weight, ownerId, weightUnit, assignedDoctor, handlingDifficulty } = req.body;
    
    const newPatient = {
      id: uuidv4(),
      name,
      species,
      breed,
      age,
      gender,
      weight,
      weightUnit: weightUnit || 'lbs',
      ownerId,
      assignedDoctor: assignedDoctor || '',
      status: 'active',
      handlingDifficulty: handlingDifficulty || null,
      createdAt: new Date().toISOString()
    };
    
    db.patients.push(newPatient);
    
    const owner = db.owners.find(o => o.id === ownerId);
    const patientWithOwner = {
      ...newPatient,
      owner: owner || null
    };
    
    res.status(201).json(patientWithOwner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/patients/:id', authenticateToken, async (req, res) => {
  try {
    const patient = db.patients.find(p => p.id === req.params.id);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    const owner = db.owners.find(o => o.id === patient.ownerId);
    const patientWithOwner = {
      ...patient,
      owner: owner || null
    };
    
    res.json(patientWithOwner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/patients/:id', authenticateToken, async (req, res) => {
  try {
    const patientId = req.params.id;
    const { name, species, breed, age, gender, weight, ownerId, weightUnit, status, assignedDoctor, handlingDifficulty } = req.body;
    
    const patientIndex = db.patients.findIndex(p => p.id === patientId);
    
    if (patientIndex === -1) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    const updatedPatient = {
      ...db.patients[patientIndex],
      name,
      species,
      breed,
      age,
      gender,
      weight,
      ownerId,
      weightUnit: weightUnit || 'lbs',
      status: status || db.patients[patientIndex].status || 'active',
      assignedDoctor: assignedDoctor || '',
      handlingDifficulty: handlingDifficulty || null
    };
    
    db.patients[patientIndex] = updatedPatient;
    
    const owner = db.owners.find(o => o.id === ownerId);
    const patientWithOwner = {
      ...updatedPatient,
      owner: owner || null
    };
    
    res.json(patientWithOwner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/patients/:id', authenticateToken, async (req, res) => {
  try {
    const patientId = req.params.id;
    const patientIndex = db.patients.findIndex(p => p.id === patientId);
    
    if (patientIndex === -1) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Check if patient has any medical records
    const hasRecords = db.medical_records.some(r => r.patientId === patientId);
    if (hasRecords) {
      return res.status(400).json({ error: 'Cannot delete patient with existing medical records' });
    }
    
    db.patients.splice(patientIndex, 1);
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Medical records routes
app.get('/api/records', authenticateToken, async (req, res) => {
  try {
    const recordsWithPatients = db.medical_records.map(record => {
      const patient = db.patients.find(p => p.id === record.patientId);
      return {
        ...record,
        patient: patient || null
      };
    }).sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));
    
    res.json(recordsWithPatients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/records', authenticateToken, async (req, res) => {
  try {
    const { patientId, visitDate, symptoms, diagnosis, treatment, notes, veterinarian } = req.body;
    
    const newRecord = {
      id: uuidv4(),
      patientId,
      visitDate,
      symptoms,
      diagnosis,
      treatment,
      notes,
      veterinarian,
      createdAt: new Date().toISOString()
    };
    
    db.medical_records.push(newRecord);
    
    const patient = db.patients.find(p => p.id === patientId);
    const recordWithPatient = {
      ...newRecord,
      patient: patient || null
    };
    
    res.status(201).json(recordWithPatient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/records/patient/:patientId', authenticateToken, async (req, res) => {
  try {
    const records = db.medical_records.filter(r => r.patientId === req.params.patientId);
    const recordsWithPatients = records.map(record => {
      const patient = db.patients.find(p => p.id === record.patientId);
      return {
        ...record,
        patient: patient || null
      };
    }).sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));
    
    res.json(recordsWithPatients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/records/:id', authenticateToken, async (req, res) => {
  try {
    const recordId = req.params.id;
    const { patientId, visitDate, symptoms, diagnosis, treatment, notes, veterinarian } = req.body;
    
    const recordIndex = db.medical_records.findIndex(r => r.id === recordId);
    
    if (recordIndex === -1) {
      return res.status(404).json({ error: 'Medical record not found' });
    }
    
    const updatedRecord = {
      ...db.medical_records[recordIndex],
      patientId,
      visitDate,
      symptoms,
      diagnosis,
      treatment,
      notes,
      veterinarian
    };
    
    db.medical_records[recordIndex] = updatedRecord;
    
    const patient = db.patients.find(p => p.id === patientId);
    const recordWithPatient = {
      ...updatedRecord,
      patient: patient || null
    };
    
    res.json(recordWithPatient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard stats route
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const recentRecords = db.medical_records
      .map(record => {
        const patient = db.patients.find(p => p.id === record.patientId);
        return {
          ...record,
          patient: patient || null
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
    
    // Count today's appointments
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = db.appointments.filter(apt => apt.date === today && apt.status === 'scheduled').length;
    
    res.json({
      totalPatients: db.patients.length,
      totalOwners: db.owners.length,
      todayAppointments,
      recentRecords
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Appointment routes
app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const appointmentsWithPatients = db.appointments.map(appointment => {
      const patient = db.patients.find(p => p.id === appointment.patientId);
      const patientWithOwner = patient ? {
        ...patient,
        owner: db.owners.find(o => o.id === patient.ownerId) || null
      } : null;
      
      return {
        ...appointment,
        patient: patientWithOwner
      };
    }).sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });
    
    res.json(appointmentsWithPatients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const { patientId, date, time, duration, reason, notes, veterinarian, status } = req.body;
    
    const newAppointment = {
      id: uuidv4(),
      patientId,
      date,
      time,
      duration,
      reason,
      notes,
      veterinarian,
      status: status || 'scheduled',
      createdAt: new Date().toISOString()
    };
    
    db.appointments.push(newAppointment);
    
    const patient = db.patients.find(p => p.id === patientId);
    const patientWithOwner = patient ? {
      ...patient,
      owner: db.owners.find(o => o.id === patient.ownerId) || null
    } : null;
    
    const appointmentWithPatient = {
      ...newAppointment,
      patient: patientWithOwner
    };
    
    res.status(201).json(appointmentWithPatient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { patientId, date, time, duration, reason, notes, veterinarian, status } = req.body;
    
    const appointmentIndex = db.appointments.findIndex(a => a.id === appointmentId);
    
    if (appointmentIndex === -1) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    const updatedAppointment = {
      ...db.appointments[appointmentIndex],
      patientId,
      date,
      time,
      duration,
      reason,
      notes,
      veterinarian,
      status
    };
    
    db.appointments[appointmentIndex] = updatedAppointment;
    
    const patient = db.patients.find(p => p.id === patientId);
    const patientWithOwner = patient ? {
      ...patient,
      owner: db.owners.find(o => o.id === patient.ownerId) || null
    } : null;
    
    const appointmentWithPatient = {
      ...updatedAppointment,
      patient: patientWithOwner
    };
    
    res.json(appointmentWithPatient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/appointments/:id/status', authenticateToken, async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { status } = req.body;
    
    const appointmentIndex = db.appointments.findIndex(a => a.id === appointmentId);
    
    if (appointmentIndex === -1) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    db.appointments[appointmentIndex].status = status;
    
    const appointment = db.appointments[appointmentIndex];
    const patient = db.patients.find(p => p.id === appointment.patientId);
    const patientWithOwner = patient ? {
      ...patient,
      owner: db.owners.find(o => o.id === patient.ownerId) || null
    } : null;
    
    const appointmentWithPatient = {
      ...appointment,
      patient: patientWithOwner
    };
    
    res.json(appointmentWithPatient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const appointmentIndex = db.appointments.findIndex(a => a.id === appointmentId);
    
    if (appointmentIndex === -1) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    db.appointments.splice(appointmentIndex, 1);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize database and start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`VetChart EMR Server running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Failed to initialize database:', error);
});

module.exports = app;