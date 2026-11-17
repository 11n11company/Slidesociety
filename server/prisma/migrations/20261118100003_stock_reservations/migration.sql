-- CreateEnum ReservationStatus
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ReservationStatus') THEN
        CREATE TYPE "ReservationStatus" AS ENUM ('RESERVED', 'CONFIRMED', 'RELEASED', 'EXPIRED');
    END IF;
END $$;

-- AlterTable Product: add reservedQuantity
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "reservedQuantity" INTEGER NOT NULL DEFAULT 0;

-- CreateTable StockReservation
CREATE TABLE IF NOT EXISTS "StockReservation" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'RESERVED',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockReservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "StockReservation_orderId_productId_key" ON "StockReservation"("orderId", "productId");
CREATE INDEX IF NOT EXISTS "StockReservation_orderId_idx" ON "StockReservation"("orderId");
CREATE INDEX IF NOT EXISTS "StockReservation_productId_idx" ON "StockReservation"("productId");
CREATE INDEX IF NOT EXISTS "StockReservation_status_idx" ON "StockReservation"("status");
CREATE INDEX IF NOT EXISTS "StockReservation_expiresAt_idx" ON "StockReservation"("expiresAt");

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'StockReservation_orderId_fkey'
    ) THEN
        ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'StockReservation_productId_fkey'
    ) THEN
        ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateSequence order_number_seq
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 2000;
