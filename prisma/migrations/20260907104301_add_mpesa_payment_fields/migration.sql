/*
  Warnings:

  - A unique constraint covering the columns `[mpesaCheckoutRequestId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mpesaReceiptNumber]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'MPESA');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "mpesaCheckoutRequestId" TEXT,
ADD COLUMN     "mpesaMerchantRequestId" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "mpesaReceiptNumber" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "provider" "PaymentProvider" NOT NULL DEFAULT 'STRIPE';

-- CreateIndex
CREATE UNIQUE INDEX "Order_mpesaCheckoutRequestId_key" ON "Order"("mpesaCheckoutRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_mpesaReceiptNumber_key" ON "Payment"("mpesaReceiptNumber");
