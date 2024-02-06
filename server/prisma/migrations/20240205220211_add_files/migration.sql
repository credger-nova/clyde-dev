-- CreateTable
CREATE TABLE "file" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "parts_req_id" INTEGER,

    CONSTRAINT "file_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_parts_req_id_fkey" FOREIGN KEY ("parts_req_id") REFERENCES "parts_req"("id") ON DELETE CASCADE ON UPDATE CASCADE;
