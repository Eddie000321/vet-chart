/*
 Seed minimal data into Prisma-backed tables so the UI shows content in DB mode.
 Usage:
   cd server && node scripts/seed_prisma.js
 Env:
   DATABASE_URL must point to Postgres
*/

const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('Prisma seed: creating owners and patients...');

    // Create a few owners
    const ownersData = [
      { firstName: 'Sarah', lastName: 'Johnson', email: 'seed_sarah.johnson@example.com', phone: '(555) 123-4567', address: '123 Oak St', notes: 'Prefers morning appointments' },
      { firstName: 'Michael', lastName: 'Chen', email: 'seed_michael.chen@example.com', phone: '(555) 234-5678', address: '456 Pine Ave', notes: 'Evening preferred' },
      { firstName: 'Emily', lastName: 'Rodriguez', email: 'seed_emily.rodriguez@example.com', phone: '(555) 345-6789', address: '789 Maple Dr', notes: null },
    ];

    const owners = [];
    for (const data of ownersData) {
      const o = await prisma.owner.upsert({
        where: { email: data.email },
        create: data,
        update: data,
      });
      owners.push(o);
    }

    // Create patients for each owner
    const species = ['Dog', 'Cat', 'Rabbit'];
    const breeds = {
      Dog: ['Golden Retriever', 'Beagle', 'Poodle'],
      Cat: ['Siamese', 'Persian', 'Maine Coon'],
      Rabbit: ['Holland Lop', 'Mini Rex'],
    };

    for (const owner of owners) {
      for (let i = 0; i < 3; i++) {
        const sp = species[i % species.length];
        await prisma.patient.create({
          data: {
            ownerId: owner.id,
            name: `Seed-${sp}-${i + 1}`,
            species: sp,
            breed: breeds[sp][i % breeds[sp].length],
            age: (i + 2),
            gender: i % 2 === 0 ? 'Male' : 'Female',
            weight: 10 + i * 2,
            weightUnit: 'lbs',
            status: 'active',
            assignedDoctor: ['J Han', 'J Lee', 'Sarah Wilson'][i % 3],
            handlingDifficulty: ['easy', 'medium', 'hard'][i % 3],
          }
        });
      }
    }

    console.log('Prisma seed completed.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

