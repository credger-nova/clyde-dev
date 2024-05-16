/*
  Warnings:

  - You are about to drop the `Vendor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Vendor";

-- CreateTable
CREATE TABLE "vendor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,

    CONSTRAINT "vendor_pkey" PRIMARY KEY ("id")
);
