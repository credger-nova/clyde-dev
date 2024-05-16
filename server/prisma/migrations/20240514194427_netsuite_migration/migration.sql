/*
  Warnings:

  - You are about to drop the column `conex_name` on the `parts_req` table. All the data in the column will be lost.
  - You are about to drop the column `pickup` on the `parts_req` table. All the data in the column will be lost.
  - You are about to drop the column `so` on the `parts_req` table. All the data in the column will be lost.
  - You are about to drop the column `truck` on the `parts_req` table. All the data in the column will be lost.

*/

-- Add new columns
ALTER TABLE "parts_req"
ADD COLUMN "conex_id" TEXT,
ADD COLUMN "pickup_id" TEXT,
ADD COLUMN "sales_order_id" TEXT,
ADD COLUMN "truck_id" TEXT;

-- Map IDs to existing columns
UPDATE "parts_req" b
SET conex_name = a.id
FROM "location" a
WHERE a.name = b.conex_name;

UPDATE "parts_req" b
SET pickup = a.id
FROM "location" a
WHERE a.name = b.pickup;

UPDATE "parts_req" b
SET so = a.id
FROM "sales_order" a
WHERE a.number = b.so;

UPDATE "parts_req" b
SET truck = a.id
FROM "truck" a
WHERE a.name = b.truck;

-- Copy column old column data to new columns
UPDATE "parts_req" SET conex_id = conex_name WHERE conex_name IS NOT NULL;
UPDATE "parts_req" SET pickup_id = pickup WHERE pickup IS NOT NULL;
UPDATE "parts_req" SET sales_order_id = so WHERE so IS NOT NULL;
UPDATE "parts_req" SET truck_id = truck WHERE truck IS NOT NULL;

-- Drop old columns
ALTER TABLE "parts_req"
DROP COLUMN "conex_name",
DROP COLUMN "pickup",
DROP COLUMN "so",
DROP COLUMN "truck";

-- AddForeignKey
ALTER TABLE "parts_req" ADD CONSTRAINT "parts_req_sales_order_id_fkey" FOREIGN KEY ("sales_order_id") REFERENCES "sales_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parts_req" ADD CONSTRAINT "parts_req_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "truck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parts_req" ADD CONSTRAINT "parts_req_pickup_id_fkey" FOREIGN KEY ("pickup_id") REFERENCES "location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parts_req" ADD CONSTRAINT "parts_req_conex_id_fkey" FOREIGN KEY ("conex_id") REFERENCES "location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
