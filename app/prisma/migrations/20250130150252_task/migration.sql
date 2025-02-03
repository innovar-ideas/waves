/*
  Warnings:

  - You are about to drop the column `user_id` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `performance_reviews` table. All the data in the column will be lost.
  - You are about to drop the column `staff_role_id` on the `staff_profiles` table. All the data in the column will be lost.
  - The `documents_url` column on the `staff_profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Contract` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Designation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Organization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Team` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamDesignation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkHistory` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[bank_id]` on the table `staff_profiles` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INFLOW', 'OUTFLOW');

-- CreateEnum
CREATE TYPE "AccountTypeEnum" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE', 'BANK', 'LOAN', 'CREDIT_CARD', 'FIXED_ASSET');

-- CreateEnum
CREATE TYPE "BudgetStatus" AS ENUM ('APPROVED', 'NOT_APPROVED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'CARD', 'CHEQUE');

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('DRAFT', 'RECEIVED', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'VOID', 'PENDING');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'VOID', 'PENDING');

-- CreateEnum
CREATE TYPE "ReconciliationStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ERROR');

-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_staff_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_template_id_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_parent_team_id_fkey";

-- DropForeignKey
ALTER TABLE "TeamDesignation" DROP CONSTRAINT "TeamDesignation_designation_id_fkey";

-- DropForeignKey
ALTER TABLE "TeamDesignation" DROP CONSTRAINT "TeamDesignation_team_id_fkey";

-- DropForeignKey
ALTER TABLE "WorkHistory" DROP CONSTRAINT "WorkHistory_staff_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "chats" DROP CONSTRAINT "chats_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "contract_templates" DROP CONSTRAINT "contract_templates_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "leave_applications" DROP CONSTRAINT "leave_applications_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "leave_settings" DROP CONSTRAINT "leave_settings_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "loan_applications" DROP CONSTRAINT "loan_applications_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "loan_settings" DROP CONSTRAINT "loan_settings_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "message_deliveries" DROP CONSTRAINT "message_deliveries_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "notification_recipients" DROP CONSTRAINT "notification_recipients_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "payroll_templates" DROP CONSTRAINT "payroll_templates_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "payrolls" DROP CONSTRAINT "payrolls_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "performance_review_template_assignments" DROP CONSTRAINT "performance_review_template_assignments_team_id_fkey";

-- DropForeignKey
ALTER TABLE "performance_reviews" DROP CONSTRAINT "performance_reviews_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "performance_reviews" DROP CONSTRAINT "performance_reviews_team_id_fkey";

-- DropForeignKey
ALTER TABLE "performance_reviews" DROP CONSTRAINT "performance_reviews_userId_fkey";

-- DropForeignKey
ALTER TABLE "performance_templates" DROP CONSTRAINT "performance_templates_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "policies_and_procedures" DROP CONSTRAINT "policies_and_procedures_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "policies_and_procedures" DROP CONSTRAINT "policies_and_procedures_team_id_fkey";

-- DropForeignKey
ALTER TABLE "staff_profiles" DROP CONSTRAINT "staff_profiles_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "staff_profiles" DROP CONSTRAINT "staff_profiles_staff_role_id_fkey";

-- DropForeignKey
ALTER TABLE "staff_profiles" DROP CONSTRAINT "staff_profiles_team_designation_id_fkey";

-- DropForeignKey
ALTER TABLE "staff_roles" DROP CONSTRAINT "staff_roles_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_organization_id_fkey";

-- DropIndex
DROP INDEX "notifications_user_id_idx";

-- DropIndex
DROP INDEX "performance_review_template_assignments_template_id_team_id_key";

-- AlterTable
ALTER TABLE "contract_templates" ADD COLUMN     "contract_duration" INTEGER,
ADD COLUMN     "sign_before" INTEGER,
ADD COLUMN     "versions" JSONB;

-- AlterTable
ALTER TABLE "leave_applications" ADD COLUMN     "approval_level" JSONB;

-- AlterTable
ALTER TABLE "leave_settings" ADD COLUMN     "role_level" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "loan_applications" ADD COLUMN     "approval_level" JSONB,
ADD COLUMN     "fully_paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_disbursed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "loan_settings" ADD COLUMN     "number_of_times" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "notification_recipients" ADD COLUMN     "is_sender" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "sender_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "performance_review_template_assignments" ADD COLUMN     "organization_id" TEXT,
ADD COLUMN     "role_level" INTEGER DEFAULT 1,
ADD COLUMN     "role_level_max" INTEGER,
ADD COLUMN     "role_level_min" INTEGER,
ALTER COLUMN "team_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "performance_reviews" DROP COLUMN "userId",
ADD COLUMN     "reviewed_by_id" TEXT;

-- AlterTable
ALTER TABLE "policies_and_procedures" ADD COLUMN     "year_validity_duration" INTEGER DEFAULT 1;

-- AlterTable
ALTER TABLE "staff_profiles" DROP COLUMN "staff_role_id",
ADD COLUMN     "bank_account_name" TEXT,
ADD COLUMN     "bank_id" TEXT,
ADD COLUMN     "is_head_of_dept" BOOLEAN DEFAULT false,
ADD COLUMN     "number_of_loans" INTEGER DEFAULT 0,
ADD COLUMN     "staffRoleId" TEXT,
DROP COLUMN "documents_url",
ADD COLUMN     "documents_url" JSONB;

-- DropTable
DROP TABLE "Contract";

-- DropTable
DROP TABLE "Designation";

-- DropTable
DROP TABLE "Organization";

-- DropTable
DROP TABLE "Team";

-- DropTable
DROP TABLE "TeamDesignation";

-- DropTable
DROP TABLE "WorkHistory";

-- CreateTable
CREATE TABLE "work_histories" (
    "id" TEXT NOT NULL,
    "staff_profile_id" TEXT NOT NULL,
    "job_title" TEXT NOT NULL,
    "company_industry" TEXT,
    "company_name" TEXT,
    "responsibilities" TEXT NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "work_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "staff_profile_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "details" JSONB NOT NULL,
    "file" TEXT,
    "organization_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "files" JSONB,
    "contract_duration" TIMESTAMP(3),
    "sign_before" TIMESTAMP(3),

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_repayments" (
    "id" TEXT NOT NULL,
    "loan_id" TEXT NOT NULL,
    "repayment_date" TIMESTAMP(3) NOT NULL,
    "amount_paid" DOUBLE PRECISION NOT NULL,
    "balance_remaining" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "organization_id" TEXT,
    "payment_method" TEXT NOT NULL,
    "remarks" TEXT,

    CONSTRAINT "loan_repayments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parent_team_id" TEXT,
    "organization_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "designations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "job_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "role_level" INTEGER DEFAULT 1,

    CONSTRAINT "designations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_designations" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "designation_id" TEXT NOT NULL,
    "quantity" INTEGER,
    "vacancies" INTEGER,
    "organization_id" TEXT NOT NULL,
    "team_job_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "team_designations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_code" TEXT,
    "organization_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preferences" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_contacts" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "user_id" TEXT,
    "street_address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "is_repeated" BOOLEAN NOT NULL DEFAULT false,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "instructions" JSONB,
    "task_repeat_time_table" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_tasks" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "task_repeat_time_table" JSONB,
    "instructions" JSONB,
    "staff_feedback" JSONB,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "staff_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accountss" (
    "id" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "account_type_enum" "AccountTypeEnum" NOT NULL DEFAULT 'INCOME',
    "account_code" TEXT NOT NULL,
    "description" TEXT,
    "account_number" TEXT,
    "bank_name" TEXT,
    "bank_branch" TEXT,
    "swift_code" TEXT,
    "routing_number" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "organization_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "accountss_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "budgeted_amount" DOUBLE PRECISION NOT NULL,
    "amount_spent" DOUBLE PRECISION NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "status" "BudgetStatus" NOT NULL DEFAULT 'NOT_APPROVED',
    "organization_id" TEXT NOT NULL,
    "expense_account_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_items" (
    "id" TEXT NOT NULL,
    "item_code" TEXT NOT NULL DEFAULT '100001',
    "description" TEXT NOT NULL,
    "budgeted_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DOUBLE PRECISION,
    "amount" DOUBLE PRECISION NOT NULL,
    "paid_in_by" TEXT,
    "assign_to" TEXT,
    "account_id" TEXT,
    "invoice_id" TEXT,
    "bill_id" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "budget_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "account_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "account_id" TEXT,
    "customer_name" TEXT NOT NULL,
    "customer_id" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "amount_paid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balance_due" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" "InvoiceStatus" NOT NULL,
    "organization_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bill" (
    "id" TEXT NOT NULL,
    "bill_number" TEXT NOT NULL,
    "account_id" TEXT,
    "vendor_name" TEXT NOT NULL,
    "vendor_id" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "amount_paid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balance_due" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" "BillStatus" NOT NULL,
    "organization_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "reference" TEXT,
    "bank_reference" TEXT,
    "description" TEXT,
    "transaction_type" "TransactionType" NOT NULL,
    "reconciliation_date" TIMESTAMP(3),
    "reconciliation_batch" TEXT,
    "account_id" TEXT,
    "invoice_id" TEXT,
    "bill_id" TEXT,
    "account_item_id" TEXT,
    "organization_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reconciled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankStatement" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "statement_date" TIMESTAMP(3) NOT NULL,
    "file_url" TEXT NOT NULL,
    "status" "ReconciliationStatus" NOT NULL,
    "opening_balance" DOUBLE PRECISION NOT NULL,
    "closing_balance" DOUBLE PRECISION NOT NULL,
    "organization_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "BankStatement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankStatementTransaction" (
    "id" TEXT NOT NULL,
    "statement_id" TEXT NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "reference" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "transaction_type" "TransactionType" NOT NULL,
    "bank_reference" TEXT,
    "transaction_code" TEXT,
    "matched_payment_id" TEXT,
    "reconciled" BOOLEAN NOT NULL DEFAULT false,
    "reconciliation_date" TIMESTAMP(3),
    "reconciliation_batch" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankStatementTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "line_items" JSONB NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "approved_by" TEXT,
    "disbursed_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_categories" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_token_key" ON "organizations"("token");

-- CreateIndex
CREATE UNIQUE INDEX "team_designations_team_id_designation_id_key" ON "team_designations"("team_id", "designation_id");

-- CreateIndex
CREATE UNIQUE INDEX "banks_name_organization_id_key" ON "banks"("name", "organization_id");

-- CreateIndex
CREATE INDEX "preferences_name_organization_id_user_id_idx" ON "preferences"("name", "organization_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "preferences_name_organization_id_user_id_key" ON "preferences"("name", "organization_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "emergency_contacts_user_id_key" ON "emergency_contacts"("user_id");

-- CreateIndex
CREATE INDEX "emergency_contacts_deleted_at_active_idx" ON "emergency_contacts"("deleted_at", "active");

-- CreateIndex
CREATE UNIQUE INDEX "accountss_organization_id_account_name_key" ON "accountss"("organization_id", "account_name");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_expense_account_id_key" ON "budgets"("expense_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "account_items_budget_id_key" ON "account_items"("budget_id");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoice_number_key" ON "Invoice"("invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "Bill_bill_number_key" ON "Bill"("bill_number");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_account_item_id_key" ON "Payment"("account_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "BankStatementTransaction_matched_payment_id_key" ON "BankStatementTransaction"("matched_payment_id");

-- CreateIndex
CREATE INDEX "BankStatementTransaction_transaction_date_idx" ON "BankStatementTransaction"("transaction_date");

-- CreateIndex
CREATE INDEX "BankStatementTransaction_bank_reference_idx" ON "BankStatementTransaction"("bank_reference");

-- CreateIndex
CREATE INDEX "BankStatementTransaction_reconciliation_batch_idx" ON "BankStatementTransaction"("reconciliation_batch");

-- CreateIndex
CREATE INDEX "BankStatementTransaction_reconciled_transaction_date_idx" ON "BankStatementTransaction"("reconciled", "transaction_date");

-- CreateIndex
CREATE UNIQUE INDEX "staff_profiles_bank_id_key" ON "staff_profiles"("bank_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_roles" ADD CONSTRAINT "staff_roles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "banks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_staffRoleId_fkey" FOREIGN KEY ("staffRoleId") REFERENCES "staff_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_team_designation_id_fkey" FOREIGN KEY ("team_designation_id") REFERENCES "team_designations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_histories" ADD CONSTRAINT "work_histories_staff_profile_id_fkey" FOREIGN KEY ("staff_profile_id") REFERENCES "staff_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_staff_profile_id_fkey" FOREIGN KEY ("staff_profile_id") REFERENCES "staff_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "contract_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_templates" ADD CONSTRAINT "contract_templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_templates" ADD CONSTRAINT "performance_templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_review_template_assignments" ADD CONSTRAINT "performance_review_template_assignments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_review_template_assignments" ADD CONSTRAINT "performance_review_template_assignments_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_templates" ADD CONSTRAINT "payroll_templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_settings" ADD CONSTRAINT "leave_settings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_applications" ADD CONSTRAINT "leave_applications_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_settings" ADD CONSTRAINT "loan_settings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_applications" ADD CONSTRAINT "loan_applications_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_repayments" ADD CONSTRAINT "loan_repayments_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_repayments" ADD CONSTRAINT "loan_repayments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_parent_team_id_fkey" FOREIGN KEY ("parent_team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_designations" ADD CONSTRAINT "team_designations_designation_id_fkey" FOREIGN KEY ("designation_id") REFERENCES "designations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_designations" ADD CONSTRAINT "team_designations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_designations" ADD CONSTRAINT "team_designations_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_deliveries" ADD CONSTRAINT "message_deliveries_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_recipients" ADD CONSTRAINT "notification_recipients_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policies_and_procedures" ADD CONSTRAINT "policies_and_procedures_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policies_and_procedures" ADD CONSTRAINT "policies_and_procedures_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banks" ADD CONSTRAINT "banks_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preferences" ADD CONSTRAINT "preferences_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preferences" ADD CONSTRAINT "preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_tasks" ADD CONSTRAINT "staff_tasks_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_tasks" ADD CONSTRAINT "staff_tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accountss" ADD CONSTRAINT "accountss_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accountss" ADD CONSTRAINT "accountss_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "accountss"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_expense_account_id_fkey" FOREIGN KEY ("expense_account_id") REFERENCES "accountss"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_items" ADD CONSTRAINT "account_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_items" ADD CONSTRAINT "account_items_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "Bill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_items" ADD CONSTRAINT "account_items_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accountss"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_items" ADD CONSTRAINT "account_items_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "budgets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accountss"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accountss"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accountss"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "Bill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_account_item_id_fkey" FOREIGN KEY ("account_item_id") REFERENCES "account_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankStatement" ADD CONSTRAINT "BankStatement_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accountss"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankStatement" ADD CONSTRAINT "BankStatement_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankStatementTransaction" ADD CONSTRAINT "BankStatementTransaction_statement_id_fkey" FOREIGN KEY ("statement_id") REFERENCES "BankStatement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankStatementTransaction" ADD CONSTRAINT "BankStatementTransaction_matched_payment_id_fkey" FOREIGN KEY ("matched_payment_id") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "expense_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_categories" ADD CONSTRAINT "expense_categories_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
