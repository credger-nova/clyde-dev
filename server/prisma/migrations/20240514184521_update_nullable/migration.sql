
-- AlterTable
ALTER TABLE "parts_req" ALTER COLUMN "pickup" DROP NOT NULL,
ALTER COLUMN "pickup" DROP DEFAULT,
ALTER COLUMN "vendor" DROP NOT NULL,
ALTER COLUMN "vendor" DROP DEFAULT;

-- AlterTable
ALTER TABLE "parts_req_row" ALTER COLUMN "mode" DROP NOT NULL;

-- Copy cost to new float column
ALTER TABLE "parts_req_row" ALTER COLUMN "cost" TYPE NUMERIC USING NULLIF("cost", '')::NUMERIC;