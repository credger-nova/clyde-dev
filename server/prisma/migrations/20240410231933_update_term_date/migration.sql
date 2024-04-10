/*
  Warnings:

  - The `termination_date` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "termination_date",
ADD COLUMN     "termination_date" TIMESTAMP(3);
