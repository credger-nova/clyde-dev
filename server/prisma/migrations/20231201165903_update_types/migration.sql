/*
  Warnings:

  - The primary key for the `parameter` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `weekly_downtime` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "parameter" DROP CONSTRAINT "parameter_unit_number_fkey";

-- DropForeignKey
ALTER TABLE "weekly_downtime" DROP CONSTRAINT "weekly_downtime_unit_number_fkey";

-- AlterTable
ALTER TABLE "parameter" DROP CONSTRAINT "parameter_pkey",
ALTER COLUMN "unit_number" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "value" SET DATA TYPE TEXT,
ADD CONSTRAINT "parameter_pkey" PRIMARY KEY ("unit_number", "name");

-- AlterTable
ALTER TABLE "weekly_downtime" DROP CONSTRAINT "weekly_downtime_pkey",
ALTER COLUMN "unit_number" SET DATA TYPE TEXT,
ALTER COLUMN "week" SET DATA TYPE TEXT,
ALTER COLUMN "ma" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "dt_hours" SET DATA TYPE DOUBLE PRECISION,
ADD CONSTRAINT "weekly_downtime_pkey" PRIMARY KEY ("unit_number", "week");

-- AddForeignKey
ALTER TABLE "parameter" ADD CONSTRAINT "parameter_unit_number_fkey" FOREIGN KEY ("unit_number") REFERENCES "unit"("unit_number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_downtime" ADD CONSTRAINT "weekly_downtime_unit_number_fkey" FOREIGN KEY ("unit_number") REFERENCES "unit"("unit_number") ON DELETE RESTRICT ON UPDATE CASCADE;
