-- CreateTable
CREATE TABLE "PartsReqRow" (
    "id" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "item_number" TEXT NOT NULL,
    "description" TEXT,
    "cost" TEXT,
    "partsReqId" INTEGER,

    CONSTRAINT "PartsReqRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parts_req" (
    "id" SERIAL NOT NULL,
    "requester" TEXT NOT NULL,
    "date" TIMESTAMPTZ(6) NOT NULL,
    "afe" TEXT,
    "so" TEXT,
    "unit_number" TEXT,
    "urgency" TEXT NOT NULL,
    "order_type" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "updated" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "parts_req_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PartsReqRow" ADD CONSTRAINT "PartsReqRow_partsReqId_fkey" FOREIGN KEY ("partsReqId") REFERENCES "parts_req"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parts_req" ADD CONSTRAINT "parts_req_unit_number_fkey" FOREIGN KEY ("unit_number") REFERENCES "unit"("unit_number") ON DELETE CASCADE ON UPDATE CASCADE;
