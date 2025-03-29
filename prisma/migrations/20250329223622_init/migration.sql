-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "birthdate" DATETIME NOT NULL,
    "deathdate" DATETIME,
    "race" TEXT,
    "ethnicity" TEXT,
    "gender" TEXT,
    "first" TEXT,
    "last" TEXT,
    "clusterId" INTEGER
);

-- CreateTable
CREATE TABLE "Condition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT,
    "start" DATETIME NOT NULL,
    "stop" DATETIME,
    CONSTRAINT "Condition_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT,
    "start" DATETIME NOT NULL,
    "stop" DATETIME,
    CONSTRAINT "Medication_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Encounter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT,
    "reasonCode" TEXT,
    "start" DATETIME NOT NULL,
    "stop" DATETIME,
    CONSTRAINT "Encounter_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
