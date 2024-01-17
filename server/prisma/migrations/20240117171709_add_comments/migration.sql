-- CreateTable
CREATE TABLE "comment" (
    "id" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,
    "parts_req_id" INTEGER,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_parts_req_id_fkey" FOREIGN KEY ("parts_req_id") REFERENCES "parts_req"("id") ON DELETE CASCADE ON UPDATE CASCADE;
