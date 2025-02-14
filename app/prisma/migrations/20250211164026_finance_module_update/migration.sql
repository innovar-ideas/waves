/*
  Warnings:

  - A unique constraint covering the columns `[purchase_order_id]` on the table `account_items` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[account_item_id]` on the table `purchase_orders` will be added. If there are existing duplicate values, this will fail.
  - Made the column `email` on table `clients` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "AccountItemStatus" AS ENUM ('PENDING', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'VOID');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NGN');

-- DropForeignKey
ALTER TABLE "purchase_orders" DROP CONSTRAINT "purchase_orders_bill_id_fkey";

-- AlterTable
ALTER TABLE "Bill" ADD COLUMN     "other_fields" JSONB;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "other_fields" JSONB;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "currency" "Currency",
ADD COLUMN     "remaining_amount" DOUBLE PRECISION,
ALTER COLUMN "transaction_type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "account_items" ADD COLUMN     "purchase_order_id" TEXT,
ADD COLUMN     "status" "AccountItemStatus";

-- AlterTable
ALTER TABLE "clients" ALTER COLUMN "email" SET NOT NULL;

-- AlterTable
ALTER TABLE "purchase_orders" ADD COLUMN     "account_item_id" TEXT,
ADD COLUMN     "vendor_id" TEXT,
ALTER COLUMN "bill_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "suppliers" ADD COLUMN     "contact_person" TEXT;

-- CreateTable
CREATE TABLE "BillPayment" (
    "id" TEXT NOT NULL,
    "bill_id" TEXT,
    "payment_id" TEXT NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "BillPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_items_purchase_order_id_key" ON "account_items"("purchase_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_account_item_id_key" ON "purchase_orders"("account_item_id");

-- AddForeignKey
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "Bill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "Bill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_account_item_id_fkey" FOREIGN KEY ("account_item_id") REFERENCES "account_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
