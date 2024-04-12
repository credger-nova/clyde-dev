/*
  Warnings:

  - You are about to drop the column `afe` on the `parts_req` table. All the data in the column will be lost.
  - You are about to drop the column `contact` on the `parts_req` table. All the data in the column will be lost.
  - You are about to drop the column `requester` on the `parts_req` table. All the data in the column will be lost.

*/

-- Add new columns
ALTER TABLE "parts_req"
ADD COLUMN     "afe_id" TEXT,
ADD COLUMN     "contact_id" TEXT,
ADD COLUMN     "requester_id" TEXT NOT NULL DEFAULT '';

-- Map IDs to existing columns
UPDATE "parts_req" b
SET requester = a.id
FROM "user" a
WHERE CONCAT(a.first_name, ' ', a.last_name) = b.requester;

UPDATE "parts_req" b
SET contact = a.id
FROM "user" a
WHERE CONCAT(a.first_name, ' ', a.last_name) = b.contact;

UPDATE "parts_req" b
SET afe = a.id
FROM "afe" a
WHERE a.number = b.afe;

-- Copy column old column data to new columns
UPDATE "parts_req" SET afe_id = afe WHERE afe IS NOT NULL;
UPDATE "parts_req" SET contact_id = contact WHERE contact IS NOT NULL;
UPDATE "parts_req" SET requester_id = requester;

-- Drop old columns
ALTER TABLE "parts_req"
DROP COLUMN "afe",
DROP COLUMN "contact",
DROP COLUMN "requester";

-- AddForeignKey
ALTER TABLE "parts_req" ADD CONSTRAINT "parts_req_afe_id_fkey" FOREIGN KEY ("afe_id") REFERENCES "afe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parts_req" ADD CONSTRAINT "parts_req_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parts_req" ADD CONSTRAINT "parts_req_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
