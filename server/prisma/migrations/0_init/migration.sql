-- CreateTable
CREATE TABLE "parameter" (
    "unit_number" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "value" VARCHAR(100),
    "timestamp" TIMESTAMPTZ(6),

    CONSTRAINT "parameter_pkey" PRIMARY KEY ("unit_number","name")
);

-- CreateTable
CREATE TABLE "unit" (
    "status" TEXT,
    "unit_number" TEXT NOT NULL,
    "customer" TEXT,
    "location" TEXT,
    "county" TEXT,
    "state" TEXT,
    "engine" TEXT,
    "engine_family" TEXT,
    "engine_serial_num" TEXT,
    "afr" TEXT,
    "catalyst" TEXT,
    "catalyst_mm" TEXT,
    "oem_hp" DOUBLE PRECISION,
    "nova_hp" DOUBLE PRECISION,
    "engine_rpm" DOUBLE PRECISION,
    "frame_rpm" DOUBLE PRECISION,
    "compressor_frame" TEXT,
    "compressor_frame_family" TEXT,
    "compressor_frame_sn" TEXT,
    "stages" TEXT,
    "cylinder_size" TEXT,
    "package_mfg_date" TIMESTAMP(6),
    "engine_mfg_date" TEXT,
    "zero_hour_date" TIMESTAMP(6),
    "compressor_frame_rebuild" TIMESTAMP(6),
    "top_end" TIMESTAMP(6),
    "oil_provider" TEXT,
    "telemetry" TEXT,
    "coordinates" TEXT,
    "trailer_unit" TEXT,
    "unit_set_date" TIMESTAMP(6),
    "billing_start_date" TIMESTAMP(6),
    "billing_end_date" TEXT,
    "last_billing_date" TIMESTAMP(6),
    "on_off_contract" TEXT,
    "mtm_last_price_increase" TEXT,
    "salesperson" TEXT,
    "contract_type_tax" TEXT,
    "contract_type_oil" TEXT,
    "monthly_rate" DOUBLE PRECISION,
    "recurring_discount" DOUBLE PRECISION,
    "sales_tax" DOUBLE PRECISION,
    "ad_valorem_heit" DOUBLE PRECISION,
    "net_revenue" DOUBLE PRECISION,
    "day_rate" TEXT,
    "origin" TEXT,
    "acq_eff_date" TIMESTAMP(6),
    "owned_leased" TEXT,
    "operational_region" TEXT,
    "finance_region" TEXT,
    "unit_profile_update_date" TIMESTAMP(6),
    "financial_sku" TEXT,
    "oem_hp_tranche" TEXT,
    "bd_comments" TEXT,
    "ops_comments" TEXT,
    "set_week" TEXT,
    "release_week" TEXT,

    CONSTRAINT "unit_pkey" PRIMARY KEY ("unit_number")
);

-- CreateTable
CREATE TABLE "weekly_downtime" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "unit_number" VARCHAR(100) NOT NULL,
    "week" VARCHAR(20) NOT NULL,
    "ma" REAL NOT NULL,
    "dt_hours" REAL NOT NULL,

    CONSTRAINT "weekly_downtime_pkey" PRIMARY KEY ("id")
);

