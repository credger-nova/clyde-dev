/*
  Warnings:

  - You are about to drop the column `partsReqId` on the `vendor_on_pr` table. All the data in the column will be lost.
  - You are about to drop the column `vendorId` on the `vendor_on_pr` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "vendor_on_pr" DROP CONSTRAINT "vendor_on_pr_partsReqId_fkey";

-- DropForeignKey
ALTER TABLE "vendor_on_pr" DROP CONSTRAINT "vendor_on_pr_vendorId_fkey";

-- AlterTable
ALTER TABLE "vendor_on_pr" DROP COLUMN "partsReqId",
DROP COLUMN "vendorId",
ADD COLUMN     "parts_req_id" INTEGER,
ADD COLUMN     "vendor_id" TEXT;

-- AddForeignKey
ALTER TABLE "vendor_on_pr" ADD CONSTRAINT "vendor_on_pr_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_on_pr" ADD CONSTRAINT "vendor_on_pr_parts_req_id_fkey" FOREIGN KEY ("parts_req_id") REFERENCES "parts_req"("id") ON DELETE SET NULL ON UPDATE CASCADE;
