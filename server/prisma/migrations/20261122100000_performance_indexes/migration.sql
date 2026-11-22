-- Phase 5F & 5G Performance Indexes and Schema Alignment

-- Product Indexes
CREATE INDEX IF NOT EXISTS "Product_priceInr_idx" ON "Product"("priceInr");
CREATE INDEX IF NOT EXISTS "Product_rating_idx" ON "Product"("rating");

-- Order Indexes
CREATE INDEX IF NOT EXISTS "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");

-- StockReservation Indexes
CREATE INDEX IF NOT EXISTS "StockReservation_status_expiresAt_idx" ON "StockReservation"("status", "expiresAt");

-- ProductReview Indexes
CREATE INDEX IF NOT EXISTS "ProductReview_orderId_idx" ON "ProductReview"("orderId");
CREATE INDEX IF NOT EXISTS "ProductReview_productId_status_idx" ON "ProductReview"("productId", "status");

-- Payment Index & Column Alignment
CREATE INDEX IF NOT EXISTS "Payment_providerPaymentId_idx" ON "Payment"("providerPaymentId");
DROP INDEX IF EXISTS "Payment_gatewayPaymentId_key";
ALTER TABLE "Payment" ALTER COLUMN "gatewayOrderId" DROP NOT NULL;

-- Timestamp Default Alignment with Prisma ORM
ALTER TABLE "Invoice" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "Payment" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "StockReservation" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- ProductReview Foreign Key Alignment
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ProductReview_orderId_fkey'
    ) THEN
        ALTER TABLE "ProductReview" DROP CONSTRAINT "ProductReview_orderId_fkey";
    END IF;
    
    ALTER TABLE "ProductReview" ALTER COLUMN "orderId" SET NOT NULL;
    
    ALTER TABLE "ProductReview" ADD CONSTRAINT "ProductReview_orderId_fkey" 
        FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;
