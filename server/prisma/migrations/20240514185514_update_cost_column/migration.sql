/*
  Warnings:

  - You are about to alter the column `cost` on the `parts_req_row` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "parts_req_row" ALTER COLUMN "cost" SET DATA TYPE DOUBLE PRECISION;

-- Convert empty strings to nulls
UPDATE "parts_req_row" SET "mode" = NULLIF("mode", '');
UPDATE "parts_req_row" SET "description" = NULLIF("description", '');
UPDATE "parts_req" SET "pickup" = NULLIF("pickup", '');
UPDATE "parts_req" SET "vendor" = NULLIF("vendor", '');