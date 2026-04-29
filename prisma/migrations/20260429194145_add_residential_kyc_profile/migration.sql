-- CreateEnum
CREATE TYPE "ResidentIdType" AS ENUM ('national_id', 'drivers_license', 'passport', 'voters_id', 'other');

-- CreateEnum
CREATE TYPE "ResidentKycStatus" AS ENUM ('not_submitted', 'pending_review', 'approved', 'rejected', 'resubmission_required');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ResidentialIntakeStatus" ADD VALUE 'approved';
ALTER TYPE "ResidentialIntakeStatus" ADD VALUE 'rejected';

-- CreateTable
CREATE TABLE "ResidentialAccountProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "trn" TEXT NOT NULL,
    "idType" "ResidentIdType" NOT NULL,
    "idDocumentPath" TEXT NOT NULL,
    "kycStatus" "ResidentKycStatus" NOT NULL DEFAULT 'pending_review',
    "reviewNotes" TEXT,
    "reviewedByAdminId" UUID,
    "reviewedAt" TIMESTAMPTZ(6),
    "submittedAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ResidentialAccountProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResidentialAccountProfile_userId_key" ON "ResidentialAccountProfile"("userId");

-- CreateIndex
CREATE INDEX "ResidentialAccountProfile_kycStatus_createdAt_idx" ON "ResidentialAccountProfile"("kycStatus", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ResidentialAccountProfile_userId_idx" ON "ResidentialAccountProfile"("userId");

-- AddForeignKey
ALTER TABLE "ResidentialAccountProfile" ADD CONSTRAINT "ResidentialAccountProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResidentialAccountProfile" ADD CONSTRAINT "ResidentialAccountProfile_reviewedByAdminId_fkey" FOREIGN KEY ("reviewedByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
