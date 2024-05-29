-- CreateTable
CREATE TABLE "vendor_on_pr" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT,
    "partsReqId" INTEGER,

    CONSTRAINT "vendor_on_pr_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vendor_on_pr" ADD CONSTRAINT "vendor_on_pr_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_on_pr" ADD CONSTRAINT "vendor_on_pr_partsReqId_fkey" FOREIGN KEY ("partsReqId") REFERENCES "parts_req"("id") ON DELETE SET NULL ON UPDATE CASCADE;
