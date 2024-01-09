/*
  Warnings:

  - You are about to drop the column `partsReqId` on the `parts_req_row` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "parts_req_row" DROP CONSTRAINT "parts_req_row_partsReqId_fkey";

-- AlterTable
ALTER TABLE "parts_req_row" DROP COLUMN "partsReqId",
ADD COLUMN     "parts_req_id" INTEGER;

-- AddForeignKey
ALTER TABLE "parts_req_row" ADD CONSTRAINT "parts_req_row_parts_req_id_fkey" FOREIGN KEY ("parts_req_id") REFERENCES "parts_req"("id") ON DELETE SET NULL ON UPDATE CASCADE;
