/*
  Warnings:

  - You are about to drop the column `deliveryInstructions` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `streetAddress` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `actorId` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `entityType` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `fixedDiscountMinor` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `maxDiscountMinor` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `minOrderAmountMinor` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `percentageDiscount` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `usedAt` on the `CouponUsage` table. All the data in the column will be lost.
  - You are about to drop the column `deliveredAt` on the `Delivery` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedDeliveryAt` on the `Delivery` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Delivery` table. All the data in the column will be lost.
  - The `status` column on the `Delivery` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `baseFeeMinor` on the `DeliveryMethod` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `DeliveryMethod` table. All the data in the column will be lost.
  - You are about to drop the column `feeMinor` on the `DeliveryZone` table. All the data in the column will be lost.
  - You are about to drop the column `freeDeliveryThresholdMinor` on the `DeliveryZone` table. All the data in the column will be lost.
  - You are about to drop the column `polygon` on the `DeliveryZone` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `DeliveryZone` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `InventoryHistory` table. All the data in the column will be lost.
  - You are about to drop the column `subscribedAt` on the `NewsletterSubscriber` table. All the data in the column will be lost.
  - You are about to drop the column `link` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `contactEmail` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `contactFullName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `contactPhone` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryFeeMinor` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `discountMinor` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingSnapshot` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `subtotalMinor` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `taxMinor` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `totalMinor` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `lineTotalMinor` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `productNameSnapshot` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `skuSnapshot` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `unitPriceMinor` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `variantLabelSnapshot` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `amountMinor` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `priceMinor` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `ratingAverage` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `ratingCount` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `salePriceMinor` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `cloudinaryId` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `priceMinor` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `salePriceMinor` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `revokedAt` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `amountMinor` on the `Refund` table. All the data in the column will be lost.
  - You are about to drop the column `paymentId` on the `Refund` table. All the data in the column will be lost.
  - You are about to drop the column `orderItemId` on the `ReturnRequest` table. All the data in the column will be lost.
  - You are about to drop the column `resolvedAt` on the `ReturnRequest` table. All the data in the column will be lost.
  - You are about to drop the column `body` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `announcementActive` on the `StoreSettings` table. All the data in the column will be lost.
  - You are about to drop the column `announcementText` on the `StoreSettings` table. All the data in the column will be lost.
  - You are about to drop the column `facebookUrl` on the `StoreSettings` table. All the data in the column will be lost.
  - You are about to drop the column `freeDeliveryThresholdMinor` on the `StoreSettings` table. All the data in the column will be lost.
  - You are about to drop the column `instagramUrl` on the `StoreSettings` table. All the data in the column will be lost.
  - You are about to drop the column `returnWindowDays` on the `StoreSettings` table. All the data in the column will be lost.
  - You are about to drop the column `taxRatePercent` on the `StoreSettings` table. All the data in the column will be lost.
  - You are about to drop the column `tiktokUrl` on the `StoreSettings` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `SupportMessage` table. All the data in the column will be lost.
  - You are about to drop the column `body` on the `SupportMessage` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `SupportMessage` table. All the data in the column will be lost.
  - You are about to drop the column `isFromStaff` on the `SupportMessage` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `SupportTicket` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetExpires` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `variantId` on the `WishlistItem` table. All the data in the column will be lost.
  - You are about to drop the `CouponCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CouponProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductCategory` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[guestToken]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tokenHash]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orderItemId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[wishlistId,productId]` on the table `WishlistItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `county` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Made the column `area` on table `Address` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `entity` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseFeeCents` to the `DeliveryMethod` table without a default value. This is not possible if the table is not empty.
  - Added the required column `feeCents` to the `DeliveryZone` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotalCents` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalCents` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Made the column `addressId` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `productName` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalCents` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPriceCents` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountCents` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceCents` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenHash` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountCents` to the `Refund` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ReturnRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `message` to the `SupportMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `SupportMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `SupportTicket` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `category` on the `SupportTicket` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'WHATSAPP', 'IN_APP');

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_actorId_fkey";

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_variantId_fkey";

-- DropForeignKey
ALTER TABLE "CouponCategory" DROP CONSTRAINT "CouponCategory_couponId_fkey";

-- DropForeignKey
ALTER TABLE "CouponProduct" DROP CONSTRAINT "CouponProduct_couponId_fkey";

-- DropForeignKey
ALTER TABLE "CouponProduct" DROP CONSTRAINT "CouponProduct_productId_fkey";

-- DropForeignKey
ALTER TABLE "CouponUsage" DROP CONSTRAINT "CouponUsage_userId_fkey";

-- DropForeignKey
ALTER TABLE "Delivery" DROP CONSTRAINT "Delivery_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_addressId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_orderId_fkey";

-- DropForeignKey
ALTER TABLE "ProductCategory" DROP CONSTRAINT "ProductCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "ProductCategory" DROP CONSTRAINT "ProductCategory_productId_fkey";

-- DropForeignKey
ALTER TABLE "Refund" DROP CONSTRAINT "Refund_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "ReturnRequest" DROP CONSTRAINT "ReturnRequest_orderItemId_fkey";

-- DropForeignKey
ALTER TABLE "SupportMessage" DROP CONSTRAINT "SupportMessage_authorId_fkey";

-- DropForeignKey
ALTER TABLE "WishlistItem" DROP CONSTRAINT "WishlistItem_variantId_fkey";

-- DropIndex
DROP INDEX "AuditLog_actorId_idx";

-- DropIndex
DROP INDEX "AuditLog_entityType_entityId_idx";

-- DropIndex
DROP INDEX "Category_parentId_idx";

-- DropIndex
DROP INDEX "Coupon_code_idx";

-- DropIndex
DROP INDEX "Inventory_quantity_idx";

-- DropIndex
DROP INDEX "Notification_userId_isRead_idx";

-- DropIndex
DROP INDEX "Order_orderNumber_idx";

-- DropIndex
DROP INDEX "OrderItem_productId_idx";

-- DropIndex
DROP INDEX "Payment_stripePaymentIntentId_key";

-- DropIndex
DROP INDEX "Product_isPublished_isBestseller_idx";

-- DropIndex
DROP INDEX "Product_isPublished_isFeatured_idx";

-- DropIndex
DROP INDEX "Product_isPublished_isNewArrival_idx";

-- DropIndex
DROP INDEX "Product_sku_idx";

-- DropIndex
DROP INDEX "Product_slug_idx";

-- DropIndex
DROP INDEX "ProductVariant_sku_key";

-- DropIndex
DROP INDEX "RefreshToken_token_key";

-- DropIndex
DROP INDEX "Refund_stripeRefundId_key";

-- DropIndex
DROP INDEX "ReturnRequest_orderId_idx";

-- DropIndex
DROP INDEX "ReturnRequest_status_idx";

-- DropIndex
DROP INDEX "Review_productId_status_idx";

-- DropIndex
DROP INDEX "Review_userId_orderItemId_key";

-- DropIndex
DROP INDEX "SupportTicket_status_idx";

-- DropIndex
DROP INDEX "SupportTicket_userId_idx";

-- DropIndex
DROP INDEX "User_emailVerificationToken_key";

-- DropIndex
DROP INDEX "User_email_idx";

-- DropIndex
DROP INDEX "User_passwordResetToken_key";

-- DropIndex
DROP INDEX "WishlistItem_wishlistId_productId_variantId_key";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "deliveryInstructions",
DROP COLUMN "region",
DROP COLUMN "streetAddress",
ADD COLUMN     "county" TEXT NOT NULL,
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "street" TEXT NOT NULL,
ALTER COLUMN "country" SET DEFAULT 'Kenya',
ALTER COLUMN "area" SET NOT NULL;

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "actorId",
DROP COLUMN "entityType",
ADD COLUMN     "entity" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "guestToken" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "fixedDiscountMinor",
DROP COLUMN "maxDiscountMinor",
DROP COLUMN "minOrderAmountMinor",
DROP COLUMN "percentageDiscount",
DROP COLUMN "updatedAt",
ADD COLUMN     "applicableCategoryIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "applicableProductIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "fixedAmountCents" INTEGER,
ADD COLUMN     "maxDiscountCents" INTEGER,
ADD COLUMN     "minOrderAmountCents" INTEGER,
ADD COLUMN     "percentage" INTEGER;

-- AlterTable
ALTER TABLE "CouponUsage" DROP COLUMN "usedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Delivery" DROP COLUMN "deliveredAt",
DROP COLUMN "estimatedDeliveryAt",
DROP COLUMN "notes",
DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'CONFIRMED';

-- AlterTable
ALTER TABLE "DeliveryMethod" DROP COLUMN "baseFeeMinor",
DROP COLUMN "type",
ADD COLUMN     "baseFeeCents" INTEGER NOT NULL,
ADD COLUMN     "estimatedDaysMax" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "estimatedDaysMin" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "DeliveryZone" DROP COLUMN "feeMinor",
DROP COLUMN "freeDeliveryThresholdMinor",
DROP COLUMN "polygon",
DROP COLUMN "region",
ADD COLUMN     "county" TEXT,
ADD COLUMN     "feeCents" INTEGER NOT NULL,
ADD COLUMN     "freeDeliveryThresholdCents" INTEGER,
ALTER COLUMN "estimatedDaysMin" SET DEFAULT 1,
ALTER COLUMN "estimatedDaysMax" SET DEFAULT 3;

-- AlterTable
ALTER TABLE "InventoryHistory" DROP COLUMN "orderId";

-- AlterTable
ALTER TABLE "NewsletterSubscriber" DROP COLUMN "subscribedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isSubscribed" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "link",
DROP COLUMN "type",
ADD COLUMN     "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "contactEmail",
DROP COLUMN "contactFullName",
DROP COLUMN "contactPhone",
DROP COLUMN "deliveryFeeMinor",
DROP COLUMN "discountMinor",
DROP COLUMN "shippingSnapshot",
DROP COLUMN "subtotalMinor",
DROP COLUMN "taxMinor",
DROP COLUMN "totalMinor",
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'KES',
ADD COLUMN     "deliveryFeeCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "deliveryNotes" TEXT,
ADD COLUMN     "discountCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "estimatedDeliveryAt" TIMESTAMP(3),
ADD COLUMN     "subtotalCents" INTEGER NOT NULL,
ADD COLUMN     "taxCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalCents" INTEGER NOT NULL,
ADD COLUMN     "trackingNumber" TEXT,
ALTER COLUMN "addressId" SET NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "lineTotalMinor",
DROP COLUMN "productNameSnapshot",
DROP COLUMN "skuSnapshot",
DROP COLUMN "unitPriceMinor",
DROP COLUMN "variantLabelSnapshot",
ADD COLUMN     "productName" TEXT NOT NULL,
ADD COLUMN     "totalCents" INTEGER NOT NULL,
ADD COLUMN     "unitPriceCents" INTEGER NOT NULL,
ADD COLUMN     "variantLabel" TEXT;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "amountMinor",
DROP COLUMN "updatedAt",
ADD COLUMN     "amountCents" INTEGER NOT NULL,
ALTER COLUMN "stripePaymentIntentId" DROP NOT NULL,
ALTER COLUMN "currency" SET DEFAULT 'KES';

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "priceMinor",
DROP COLUMN "ratingAverage",
DROP COLUMN "ratingCount",
DROP COLUMN "salePriceMinor",
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'KES',
ADD COLUMN     "priceCents" INTEGER NOT NULL,
ADD COLUMN     "salePriceCents" INTEGER,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "ProductImage" DROP COLUMN "cloudinaryId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "createdAt",
DROP COLUMN "priceMinor",
DROP COLUMN "salePriceMinor",
DROP COLUMN "sku",
DROP COLUMN "updatedAt",
ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priceCents" INTEGER,
ADD COLUMN     "skuSuffix" TEXT;

-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "revokedAt",
DROP COLUMN "token",
ADD COLUMN     "revoked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tokenHash" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Refund" DROP COLUMN "amountMinor",
DROP COLUMN "paymentId",
ADD COLUMN     "amountCents" INTEGER NOT NULL,
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "stripeRefundId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ReturnRequest" DROP COLUMN "orderItemId",
DROP COLUMN "resolvedAt",
ADD COLUMN     "refundStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "body",
DROP COLUMN "deletedAt",
DROP COLUMN "title",
DROP COLUMN "updatedAt",
ADD COLUMN     "comment" TEXT;

-- AlterTable
ALTER TABLE "StoreSettings" DROP COLUMN "announcementActive",
DROP COLUMN "announcementText",
DROP COLUMN "facebookUrl",
DROP COLUMN "freeDeliveryThresholdMinor",
DROP COLUMN "instagramUrl",
DROP COLUMN "returnWindowDays",
DROP COLUMN "taxRatePercent",
DROP COLUMN "tiktokUrl",
ADD COLUMN     "announcement" TEXT,
ADD COLUMN     "freeShippingThresholdCents" INTEGER,
ADD COLUMN     "returnPeriodDays" INTEGER NOT NULL DEFAULT 7,
ADD COLUMN     "taxPercentage" INTEGER DEFAULT 0,
ALTER COLUMN "id" SET DEFAULT 'singleton';

-- AlterTable
ALTER TABLE "SupportMessage" DROP COLUMN "authorId",
DROP COLUMN "body",
DROP COLUMN "imageUrl",
DROP COLUMN "isFromStaff",
ADD COLUMN     "isStaff" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "message" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SupportTicket" DROP COLUMN "orderId",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "orderNumber" TEXT,
DROP COLUMN "category",
ADD COLUMN     "category" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerificationToken",
DROP COLUMN "passwordResetExpires",
DROP COLUMN "passwordResetToken",
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "WishlistItem" DROP COLUMN "variantId";

-- DropTable
DROP TABLE "CouponCategory";

-- DropTable
DROP TABLE "CouponProduct";

-- DropTable
DROP TABLE "ProductCategory";

-- DropEnum
DROP TYPE "DeliveryMethodType";

-- DropEnum
DROP TYPE "DeliveryStatus";

-- DropEnum
DROP TYPE "NotificationType";

-- DropEnum
DROP TYPE "TicketCategory";

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_guestToken_key" ON "Cart"("guestToken");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isAdmin_idx" ON "Notification"("isAdmin");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_isPublished_idx" ON "Product"("isPublished");

-- CreateIndex
CREATE INDEX "Product_isFeatured_isBestseller_isNewArrival_idx" ON "Product"("isFeatured", "isBestseller", "isNewArrival");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "Review"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_orderItemId_key" ON "Review"("orderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "WishlistItem_wishlistId_productId_key" ON "WishlistItem"("wishlistId", "productId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportMessage" ADD CONSTRAINT "SupportMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
