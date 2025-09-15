/*
 Seed Prisma tables with synthetic data across all models.

 Models covered: User (few), Owner, Patient, MedicalRecord, Appointment, Bill

 Controls via env (with defaults):
   OWNERS=1000
   PATIENTS_PER_OWNER=2
   RECORDS_PER_PATIENT=3
   APPTS_PER_PATIENT=1
   BILLS_PER_PATIENT=1
   BATCH=1000

 Usage examples:
   # small UI-friendly seed
   OWNERS=100 PATIENTS_PER_OWNER=2 node scripts/seed_prisma_all.js

   # larger (be mindful of memory/time)
   OWNERS=5000 PATIENTS_PER_OWNER=2 RECORDS_PER_PATIENT=5 APPTS_PER_PATIENT=2 BILLS_PER_PATIENT=1 BATCH=2000 node scripts/seed_prisma_all.js
*/

const { PrismaClient, Prisma } = require('@prisma/client');

const OWNERS = Number(process.env.OWNERS || 1000);
const PATIENTS_PER_OWNER = Number(process.env.PATIENTS_PER_OWNER || 2);
const RECORDS_PER_PATIENT = Number(process.env.RECORDS_PER_PATIENT || 3);
const APPTS_PER_PATIENT = Number(process.env.APPTS_PER_PATIENT || 1);
const BILLS_PER_PATIENT = Number(process.env.BILLS_PER_PATIENT || 1);
const BATCH = Math.max(100, Number(process.env.BATCH || 1000));

const prisma = new PrismaClient();

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max, digits = 1) { return Number((Math.random() * (max - min) + min).toFixed(digits)); }
function dateWithin(days) {
  const now = new Date();
  const past = new Date(now.getTime() - randInt(0, days) * 24 * 60 * 60 * 1000);
  return past;
}
function timeHHMM() {
  const h = String(randInt(8, 18)).padStart(2, '0');
  const m = pick(['00', '15', '30', '45']);
  return `${h}:${m}`;
}

async function main() {
  console.log('Prisma seed (all models) starting...');

  // 0) Clean tables
  console.log('Truncating tables (CASCADE)...');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Bill","Appointment","MedicalRecord","Patient","Owner","User" RESTART IDENTITY CASCADE');

  // 1) Seed Users (optional, not used by runtime login yet)
  console.log('Seeding users...');
  await prisma.user.createMany({
    data: [
      { id: Prisma.cuid(), email: 'admin@vetchart.com', username: 'admin', firstName: 'Admin', lastName: 'User', password: 'hashed', roles: ['admin','veterinarian'] },
      { id: Prisma.cuid(), email: 'vet@vetchart.com', username: 'vet', firstName: 'Sarah', lastName: 'Wilson', password: 'hashed', roles: ['veterinarian'] },
      { id: Prisma.cuid(), email: 'staff@vetchart.com', username: 'staff', firstName: 'Clinic', lastName: 'Staff', password: 'hashed', roles: ['staff'] },
    ],
    skipDuplicates: true,
  });

  // 2) Seed Owners
  console.log(`Seeding owners: ${OWNERS}`);
  const firstNames = ['James','Mary','Robert','Patricia','John','Jennifer','Michael','Linda','William','Elizabeth','David','Barbara','Richard','Susan','Joseph','Jessica','Thomas','Sarah','Charles','Karen'];
  const lastNames  = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin'];

  const ownerIds = [];
  let buffer = [];
  for (let i = 0; i < OWNERS; i++) {
    const id = Prisma.cuid();
    ownerIds.push(id);
    const fn = pick(firstNames), ln = pick(lastNames);
    buffer.push({
      id,
      firstName: fn,
      lastName: ln,
      email: `seed_${i}_${fn}.${ln}@example.com`.toLowerCase(),
      phone: `(${randInt(100,999)}) ${randInt(100,999)}-${randInt(1000,9999)}`,
      address: `${randInt(1,9999)} Main St, Springfield` ,
      notes: Math.random() < 0.2 ? 'Prefers morning appointments' : null,
      createdAt: dateWithin(365),
    });
    if (buffer.length >= BATCH) {
      await prisma.owner.createMany({ data: buffer, skipDuplicates: true });
      buffer = [];
    }
  }
  if (buffer.length) await prisma.owner.createMany({ data: buffer, skipDuplicates: true });

  // 3) Seed Patients
  const totalPatients = OWNERS * PATIENTS_PER_OWNER;
  console.log(`Seeding patients: ~${totalPatients}`);
  const species = ['Dog','Cat','Rabbit','Bird','Reptile'];
  const breeds = {
    Dog: ['Labrador Retriever','Golden Retriever','German Shepherd','Beagle','Poodle','Bulldog'],
    Cat: ['Siamese','Persian','Maine Coon','Bengal','Sphynx','Ragdoll'],
    Rabbit: ['Holland Lop','Netherland Dwarf','Mini Rex','Lionhead'],
    Bird: ['Parakeet','Cockatiel','Lovebird','Canary'],
    Reptile: ['Bearded Dragon','Leopard Gecko','Corn Snake','Ball Python'],
  };

  const patientIds = [];
  const patientOwner = new Map();
  buffer = [];
  for (let oi = 0; oi < ownerIds.length; oi++) {
    const ownerId = ownerIds[oi];
    const pCount = PATIENTS_PER_OWNER;
    for (let j = 0; j < pCount; j++) {
      const id = Prisma.cuid();
      patientIds.push(id);
      patientOwner.set(id, ownerId);
      const sp = Math.random() < 0.45 ? 'Dog' : (Math.random() < 0.8 ? 'Cat' : pick(['Rabbit','Bird','Reptile']));
      buffer.push({
        id,
        name: pick(['Buddy','Bella','Charlie','Luna','Max','Lucy','Cooper','Daisy','Rocky','Lily','Milo','Zoe','Bailey','Chloe','Toby','Nala','Sadie','Leo','Stella','Jack']),
        species: sp,
        breed: pick(breeds[sp]),
        age: randInt(1, 16),
        gender: pick(['Male','Female']),
        weight: randFloat(3, 100, 1),
        weightUnit: 'lbs',
        ownerId,
        assignedDoctor: pick(['J Han','J Lee','Sarah Wilson','Michael Brown']),
        status: Math.random() < 0.1 ? 'inactive' : 'active',
        handlingDifficulty: pick(['easy','medium','hard']),
        createdAt: dateWithin(365),
      });
      if (buffer.length >= BATCH) {
        await prisma.patient.createMany({ data: buffer, skipDuplicates: true });
        buffer = [];
      }
    }
  }
  if (buffer.length) await prisma.patient.createMany({ data: buffer, skipDuplicates: true });

  // 4) Medical Records
  console.log(`Seeding medical records per patient: ${RECORDS_PER_PATIENT}`);
  const recTypes = ['vaccine','surgery','treatment','dental'];
  buffer = [];
  // Map of patient -> record IDs to later link bills
  const patientToRecordIds = new Map();
  for (const pid of patientIds) {
    const ids = [];
    for (let r = 0; r < RECORDS_PER_PATIENT; r++) {
      const id = Prisma.cuid();
      ids.push(id);
      buffer.push({
        id,
        patientId: pid,
        visitDate: dateWithin(365),
        recordType: pick(recTypes),
        symptoms: pick([
          'Limping front leg', 'Excessive scratching', 'Vomiting 2 days', 'Annual wellness check',
          'Dental cleaning follow-up', 'Skin irritation', 'Loss of appetite', 'Lethargy'
        ]),
        diagnosis: pick(['Sprain','Ear mites','Gastroenteritis','Healthy','Dermatitis','Dental plaque']),
        treatment: pick([
          'Rest + anti-inflammatory', 'Ear drops 10 days', 'Bland diet + probiotics', 'DHPP booster', 'Antibiotics 7 days'
        ]),
        notes: Math.random() < 0.5 ? 'Recheck in 1-2 weeks' : null,
        veterinarian: pick(['J Han','J Lee','Sarah Wilson','Michael Brown']),
        createdAt: dateWithin(365),
      });
      if (buffer.length >= BATCH) {
        await prisma.medicalRecord.createMany({ data: buffer, skipDuplicates: true });
        buffer = [];
      }
    }
    patientToRecordIds.set(pid, ids);
  }
  if (buffer.length) await prisma.medicalRecord.createMany({ data: buffer, skipDuplicates: true });

  // 5) Appointments
  console.log(`Seeding appointments per patient: ${APPTS_PER_PATIENT}`);
  buffer = [];
  const patientToAppointmentIds = new Map();
  for (const pid of patientIds) {
    const apptIds = [];
    for (let a = 0; a < APPTS_PER_PATIENT; a++) {
      const id = Prisma.cuid();
      apptIds.push(id);
      buffer.push({
        id,
        patientId: pid,
        date: dateWithin(90),
        time: timeHHMM(),
        duration: pick([15, 20, 30, 45, 60]),
        reason: pick(['Wellness exam','Vaccination','Follow-up','Surgery consult','Dental cleaning']),
        status: pick(['scheduled','completed','cancelled','no-show'].concat(['scheduled','completed'])),
        notes: Math.random() < 0.3 ? 'Handle gently' : null,
        veterinarian: pick(['J Han','J Lee','Sarah Wilson','Michael Brown']),
        createdAt: dateWithin(120),
      });
      if (buffer.length >= BATCH) {
        await prisma.appointment.createMany({ data: buffer, skipDuplicates: true });
        buffer = [];
      }
    }
    patientToAppointmentIds.set(pid, apptIds);
  }
  if (buffer.length) await prisma.appointment.createMany({ data: buffer, skipDuplicates: true });

  // 6) Bills
  console.log(`Seeding bills per patient: ${BILLS_PER_PATIENT}`);
  buffer = [];
  let billCounter = 0;
  for (const pid of patientIds) {
    const recIds = patientToRecordIds.get(pid) || [];
    const apptIds = patientToAppointmentIds.get(pid) || [];
    for (let b = 0; b < BILLS_PER_PATIENT; b++) {
      const id = Prisma.cuid();
      const resolvedOwnerId = patientOwner.get(pid);
      const medIds = recIds.slice(0, randInt(1, Math.max(1, recIds.length)));
      const items = [];
      const lineCount = randInt(1, 4);
      for (let li = 0; li < lineCount; li++) {
        const qty = randInt(1, 2);
        const unit = randFloat(25, 120, 2);
        items.push({ id: String(li + 1), description: pick(['Exam','Vaccination','Lab Test','Medication','Procedure']), quantity: qty, unitPrice: unit, totalPrice: Number((qty * unit).toFixed(2)) });
      }
      const subtotal = Number(items.reduce((s, it) => s + it.totalPrice, 0).toFixed(2));
      const tax = Number((subtotal * 0.08).toFixed(2));
      const totalAmount = Number((subtotal + tax).toFixed(2));
      const billNumber = `BILL-${String(++billCounter).padStart(6, '0')}`;
      buffer.push({
        id,
        billNumber,
        ownerId: resolvedOwnerId, // may be null temporarily if query failed; fallback later
        patientId: pid,
        appointmentId: apptIds.length ? pick(apptIds) : null,
        medicalRecordIds: medIds,
        items,
        subtotal,
        tax,
        totalAmount,
        status: pick(['draft','sent','paid','overdue','cancelled'].concat(['draft','sent','paid'])),
        billDate: dateWithin(120),
        dueDate: dateWithin(90),
        notes: Math.random() < 0.2 ? 'Pay within 30 days' : null,
        createdAt: dateWithin(120),
      });
      if (buffer.length >= Math.max(200, Math.floor(BATCH / 2))) {
        await prisma.bill.createMany({ data: buffer, skipDuplicates: true });
        buffer = [];
      }
    }
  }
  if (buffer.length) await prisma.bill.createMany({ data: buffer, skipDuplicates: true });

  console.log('Prisma seed completed.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
