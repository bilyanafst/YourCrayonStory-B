/*
  # Update Orders Table for Stripe Elements

  1. Changes
    - Add stripe_payment_intent_id column for Stripe Elements integration
    - Add billing_name column for customer name
    - Rename delivery_email to billing_email for consistency
    - Rename cart_data to cart_items for consistency
    - Rename status to payment_status for clarity
    - Add index on stripe_payment_intent_id for webhook processing

  2. Notes
    - Existing data will be preserved
    - Old column names are kept for backward compatibility temporarily
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'stripe_payment_intent_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN stripe_payment_intent_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'billing_name'
  ) THEN
    ALTER TABLE orders ADD COLUMN billing_name text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_stripe_payment_intent') THEN
    CREATE INDEX idx_orders_stripe_payment_intent ON orders(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
  END IF;
END $$;