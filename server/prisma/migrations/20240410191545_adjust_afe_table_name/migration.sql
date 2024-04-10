/*
  Warnings:

  - You are about to drop the `AFE` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AFE" DROP CONSTRAINT "AFE_unit_number_fkey";

-- DropTable
DROP TABLE "AFE";

-- CreateTable
CREATE TABLE "afe" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "unit_number" TEXT NOT NULL,
    "amount" TEXT NOT NULL,

    CONSTRAINT "afe_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "afe" ADD CONSTRAINT "afe_unit_number_fkey" FOREIGN KEY ("unit_number") REFERENCES "unit"("unit_number") ON DELETE CASCADE ON UPDATE CASCADE;
