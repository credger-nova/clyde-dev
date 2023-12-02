-- DropForeignKey
ALTER TABLE "parameter" DROP CONSTRAINT "parameter_unit_number_fkey";

-- DropForeignKey
ALTER TABLE "weekly_downtime" DROP CONSTRAINT "weekly_downtime_unit_number_fkey";

-- AddForeignKey
ALTER TABLE "parameter" ADD CONSTRAINT "parameter_unit_number_fkey" FOREIGN KEY ("unit_number") REFERENCES "unit"("unit_number") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_downtime" ADD CONSTRAINT "weekly_downtime_unit_number_fkey" FOREIGN KEY ("unit_number") REFERENCES "unit"("unit_number") ON DELETE CASCADE ON UPDATE CASCADE;
