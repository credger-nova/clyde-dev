/*
  Warnings:

  - You are about to drop the `PartsReqRow` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PartsReqRow" DROP CONSTRAINT "PartsReqRow_partsReqId_fkey";

-- DropTable
DROP TABLE "PartsReqRow";

-- CreateTable
CREATE TABLE "parts_req_row" (
    "id" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "item_number" TEXT NOT NULL,
    "description" TEXT,
    "cost" TEXT,
    "partsReqId" INTEGER,

    CONSTRAINT "parts_req_row_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "parts_req_row" ADD CONSTRAINT "parts_req_row_partsReqId_fkey" FOREIGN KEY ("partsReqId") REFERENCES "parts_req"("id") ON DELETE CASCADE ON UPDATE CASCADE;
