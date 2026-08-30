-- MIGRATION SCRIPT FOR VANESSA GONZALEZ STUDIO
-- Run this in the Supabase SQL Editor

-- 1. Agregar campo deposit_amount a services
ALTER TABLE services ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0;

-- 2. Consolidar el índice único de clientes por email
ALTER TABLE clients ADD CONSTRAINT unique_email UNIQUE (email);

-- 3. Agregar campo deposit_amount a Appointments
ALTER TABLE "Appointments" ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0;

