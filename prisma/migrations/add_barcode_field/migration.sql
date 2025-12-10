-- Add barcode field to Product table
ALTER TABLE products ADD COLUMN barcode TEXT;

-- Create unique index for barcode
CREATE UNIQUE INDEX products_barcode_key ON products(barcode) WHERE barcode IS NOT NULL;
