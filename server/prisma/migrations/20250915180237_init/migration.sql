-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roles" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Owner" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Patient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "weightUnit" TEXT DEFAULT 'lbs',
    "status" TEXT NOT NULL DEFAULT 'active',
    "assignedDoctor" TEXT,
    "handlingDifficulty" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MedicalRecord" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "recordType" TEXT NOT NULL DEFAULT 'treatment',
    "symptoms" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "treatment" TEXT NOT NULL,
    "notes" TEXT,
    "veterinarian" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Appointment" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "notes" TEXT,
    "veterinarian" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Bill" (
    "id" TEXT NOT NULL,
    "billNumber" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "medicalRecordIds" TEXT[],
    "items" JSONB NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "billDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Owner_email_key" ON "public"."Owner"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Bill_billNumber_key" ON "public"."Bill"("billNumber");

-- AddForeignKey
ALTER TABLE "public"."Patient" ADD CONSTRAINT "Patient_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedicalRecord" ADD CONSTRAINT "MedicalRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bill" ADD CONSTRAINT "Bill_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bill" ADD CONSTRAINT "Bill_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bill" ADD CONSTRAINT "Bill_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
