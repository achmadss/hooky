-- Add column with temporary default to handle existing rows
ALTER TABLE "requests" ADD COLUMN "webhookToken" TEXT DEFAULT 'legacy';

-- Update existing rows with placeholder (these will need manual handling)
UPDATE "requests" SET "webhookToken" = 'legacy' WHERE "webhookToken" IS NULL;

-- Make the column required (remove default after data is fixed)
ALTER TABLE "requests" ALTER COLUMN "webhookToken" DROP DEFAULT;
