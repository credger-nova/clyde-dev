-- CreateTable
CREATE TABLE "AFE" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "unit_number" TEXT NOT NULL,
    "amount" TEXT NOT NULL,

    CONSTRAINT "AFE_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AFE" ADD CONSTRAINT "AFE_unit_number_fkey" FOREIGN KEY ("unit_number") REFERENCES "unit"("unit_number") ON DELETE CASCADE ON UPDATE CASCADE;
