-- CreateTable
CREATE TABLE "service_report" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "observer_id" TEXT NOT NULL,
    "start_work" TIMESTAMP(3),
    "stop_work" TIMESTAMP(3),
    "operation_codes" TEXT,
    "operation_codes_third" TEXT,
    "unit_number" TEXT,
    "function_performed" TEXT,
    "region" TEXT,
    "what_was_found" TEXT,
    "what_was_performed" TEXT,
    "engine_hours" INTEGER,
    "hours_worked" DOUBLE PRECISION,

    CONSTRAINT "service_report_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "service_report" ADD CONSTRAINT "service_report_observer_id_fkey" FOREIGN KEY ("observer_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_report" ADD CONSTRAINT "service_report_unit_number_fkey" FOREIGN KEY ("unit_number") REFERENCES "unit"("unit_number") ON DELETE SET NULL ON UPDATE CASCADE;
