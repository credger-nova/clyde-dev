-- AlterTable
ALTER TABLE "user" ADD COLUMN     "hire_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "rotator" BOOLEAN NOT NULL DEFAULT false;
