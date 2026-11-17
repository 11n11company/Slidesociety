-- AlterTable
ALTER TABLE "Order" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'INR',
ADD COLUMN "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
ADD COLUMN "idempotencyKey" TEXT,
ADD COLUMN "shippingAddressSnapshot" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN "productCategory" TEXT,
ADD COLUMN "productImageUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON "Order"("idempotencyKey");
