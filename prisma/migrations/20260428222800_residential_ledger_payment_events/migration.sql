-- CreateEnum
CREATE TYPE "ResidentialWalletTxType" AS ENUM ('top_up', 'dispatch_hold', 'dispatch_charge', 'hold_release', 'refund', 'gift_card_redemption', 'scan_pay_charge', 'adjustment');

-- CreateEnum
CREATE TYPE "ResidentialPaymentStatus" AS ENUM ('pending', 'authorized', 'captured', 'failed', 'refunded', 'cancelled');

-- CreateEnum
CREATE TYPE "ResidentialRequestEventType" AS ENUM ('submitted', 'payment_authorized', 'payment_captured', 'payment_failed', 'payment_refunded', 'rider_assigned', 'pickup_confirmed', 'in_transit', 'delivered', 'failed', 'cancelled', 'note_added');

-- AlterTable
ALTER TABLE "ResidentialDispatchRequest" ADD COLUMN     "authorizedAt" TIMESTAMPTZ(6),
ADD COLUMN     "capturedAt" TIMESTAMPTZ(6),
ADD COLUMN     "paymentReference" TEXT,
ADD COLUMN     "paymentStatus" "ResidentialPaymentStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN     "refundedAt" TIMESTAMPTZ(6);

-- CreateTable
CREATE TABLE "ResidentialWalletTransaction" (
    "id" UUID NOT NULL,
    "walletId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "ResidentialWalletTxType" NOT NULL,
    "amountJMD" INTEGER NOT NULL,
    "balanceAfterJMD" INTEGER NOT NULL,
    "reference" TEXT,
    "orderId" UUID,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ResidentialWalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResidentialRequestEvent" (
    "id" UUID NOT NULL,
    "requestId" UUID NOT NULL,
    "eventType" "ResidentialRequestEventType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "actorType" TEXT NOT NULL,
    "actorId" UUID,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ResidentialRequestEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResidentialWalletTransaction_walletId_createdAt_idx" ON "ResidentialWalletTransaction"("walletId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ResidentialWalletTransaction_userId_createdAt_idx" ON "ResidentialWalletTransaction"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ResidentialRequestEvent_requestId_createdAt_idx" ON "ResidentialRequestEvent"("requestId", "createdAt" ASC);

-- AddForeignKey
ALTER TABLE "ResidentialWalletTransaction" ADD CONSTRAINT "ResidentialWalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "ResidentialWallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResidentialWalletTransaction" ADD CONSTRAINT "ResidentialWalletTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResidentialRequestEvent" ADD CONSTRAINT "ResidentialRequestEvent_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ResidentialDispatchRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
