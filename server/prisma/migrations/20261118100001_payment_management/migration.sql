-- AlterTable Payment
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "provider" TEXT NOT NULL DEFAULT 'RAZORPAY';
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "providerOrderId" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "providerPaymentId" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "failureReason" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill providerOrderId from gatewayOrderId if existing records
UPDATE "Payment" SET "providerOrderId" = "gatewayOrderId" WHERE "providerOrderId" IS NULL;
ALTER TABLE "Payment" ALTER COLUMN "providerOrderId" SET NOT NULL;

-- Backfill providerPaymentId from gatewayPaymentId if existing records
UPDATE "Payment" SET "providerPaymentId" = "gatewayPaymentId" WHERE "providerPaymentId" IS NULL;

-- Update default for status
ALTER TABLE "Payment" ALTER COLUMN "status" SET DEFAULT 'CREATED';

-- Create unique index on providerPaymentId
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_providerPaymentId_key" ON "Payment"("providerPaymentId");
CREATE INDEX IF NOT EXISTS "Payment_providerOrderId_idx" ON "Payment"("providerOrderId");

-- CreateTable ProcessedWebhookEvent
CREATE TABLE IF NOT EXISTS "ProcessedWebhookEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "entityId" TEXT,
    "payload" TEXT,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ProcessedWebhookEvent_eventType_idx" ON "ProcessedWebhookEvent"("eventType");
