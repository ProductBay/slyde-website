/*
  Warnings:

  - Changed the type of `paymentPreference` on the `ResidentialDispatchIntent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `userId` to the `ResidentialLead` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ResidentialDispatchStatus" AS ENUM ('submitted', 'payment_pending', 'confirmed', 'rider_assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "ResidentialPaymentMethod" AS ENUM ('wallet', 'card', 'slyde_gift_card', 'adash_scan_to_pay');

-- AlterTable
ALTER TABLE "ResidentialDispatchIntent" DROP COLUMN "paymentPreference",
ADD COLUMN     "paymentPreference" "ResidentialPaymentMethod" NOT NULL;

-- AlterTable
ALTER TABLE "ResidentialLead" ADD COLUMN     "userId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "ResidentialDispatchRequest" (
    "id" UUID NOT NULL,
    "leadId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "referenceCode" TEXT NOT NULL,
    "status" "ResidentialDispatchStatus" NOT NULL,
    "paymentMethod" "ResidentialPaymentMethod" NOT NULL,
    "pickupAddress" TEXT NOT NULL,
    "pickupParish" TEXT NOT NULL,
    "pickupArea" TEXT NOT NULL,
    "dropoffAddress" TEXT NOT NULL,
    "dropoffParish" TEXT NOT NULL,
    "dropoffArea" TEXT NOT NULL,
    "parcelCategory" "ResidentialParcelCategory" NOT NULL,
    "parcelNotes" TEXT,
    "urgency" TEXT NOT NULL,
    "preferredWindow" TEXT,
    "submittedAt" TIMESTAMPTZ(6) NOT NULL,
    "confirmedAt" TIMESTAMPTZ(6),
    "riderAssignedAt" TIMESTAMPTZ(6),
    "pickedUpAt" TIMESTAMPTZ(6),
    "deliveredAt" TIMESTAMPTZ(6),
    "cancelledAt" TIMESTAMPTZ(6),
    "failureReason" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ResidentialDispatchRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResidentialWallet" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "currency" TEXT NOT NULL,
    "availableBalance" INTEGER NOT NULL,
    "heldBalance" INTEGER NOT NULL,
    "totalLifetimeTopUp" INTEGER NOT NULL,
    "lastTopUpAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ResidentialWallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResidentialDispatchRequest_leadId_key" ON "ResidentialDispatchRequest"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "ResidentialDispatchRequest_referenceCode_key" ON "ResidentialDispatchRequest"("referenceCode");

-- CreateIndex
CREATE INDEX "ResidentialDispatchRequest_userId_createdAt_idx" ON "ResidentialDispatchRequest"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ResidentialDispatchRequest_status_createdAt_idx" ON "ResidentialDispatchRequest"("status", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ResidentialWallet_userId_key" ON "ResidentialWallet"("userId");

-- CreateIndex
CREATE INDEX "ResidentialLead_userId_createdAt_idx" ON "ResidentialLead"("userId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "ResidentialLead" ADD CONSTRAINT "ResidentialLead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResidentialDispatchRequest" ADD CONSTRAINT "ResidentialDispatchRequest_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "ResidentialLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResidentialDispatchRequest" ADD CONSTRAINT "ResidentialDispatchRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResidentialWallet" ADD CONSTRAINT "ResidentialWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
