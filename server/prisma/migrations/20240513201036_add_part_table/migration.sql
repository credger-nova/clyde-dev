-- CreateTable
CREATE TABLE "part" (
    "id" TEXT NOT NULL,
    "item_number" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "mode" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,

    CONSTRAINT "part_pkey" PRIMARY KEY ("id")
);
