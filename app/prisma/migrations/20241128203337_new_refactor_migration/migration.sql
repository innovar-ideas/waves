/*
  Warnings:

  - You are about to drop the column `user_id` on the `notification_recipients` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[recipient_id,notification_id]` on the table `notification_recipients` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `recipient_id` to the `notification_recipients` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "notification_recipients" DROP CONSTRAINT "notification_recipients_user_id_fkey";

-- DropIndex
DROP INDEX "notification_recipients_user_id_notification_id_key";

-- AlterTable
ALTER TABLE "notification_recipients" DROP COLUMN "user_id",
ADD COLUMN     "recipient_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "notification_recipients_recipient_id_notification_id_key" ON "notification_recipients"("recipient_id", "notification_id");

-- AddForeignKey
ALTER TABLE "notification_recipients" ADD CONSTRAINT "notification_recipients_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
