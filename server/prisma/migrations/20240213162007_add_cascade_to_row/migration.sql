-- DropForeignKey
ALTER TABLE "parts_req_row" DROP CONSTRAINT "parts_req_row_parts_req_id_fkey";

-- AddForeignKey
ALTER TABLE "parts_req_row" ADD CONSTRAINT "parts_req_row_parts_req_id_fkey" FOREIGN KEY ("parts_req_id") REFERENCES "parts_req"("id") ON DELETE CASCADE ON UPDATE CASCADE;
