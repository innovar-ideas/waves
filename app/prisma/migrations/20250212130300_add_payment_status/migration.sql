-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('DEPOSITED', 'COMPLETED', 'FAILED', 'PENDING', 'REFUNDED', 'VOID', 'CANCELED');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "status" "PaymentStatus";
