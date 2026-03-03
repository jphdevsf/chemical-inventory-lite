-- Chemical Inventory Lite - Complete Database Schema
-- Run this file to set up all required tables for the application
--
-- Usage: psql $DATABASE_URL -f server/db-setup/init-database.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- CORE INVENTORY TABLES
-- ============================================

-- Chemicals: Stores chemical compound information
CREATE TABLE IF NOT EXISTS chemicals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chemical_name VARCHAR(255) NOT NULL,
  cid_number VARCHAR(50),
  cas_number VARCHAR(50),
  molecular_formula VARCHAR(255),
  hazard_class VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Suppliers: Stores supplier contact details
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  address TEXT,
  website VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- AUTHENTICATION TABLES (Future Use)
-- ============================================

-- Users: User accounts for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User Roles: Role definitions for permission management
CREATE TYPE role_permission AS ENUM ('admin', 'editor', 'viewer');

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name role_permission NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User Role Assignments: Maps users to roles
CREATE TABLE IF NOT EXISTS user_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  UNIQUE(user_id, role_id)
);

-- ============================================
-- INVENTORY TABLE (links chemicals + suppliers)
-- ============================================

-- Inventory: Main inventory table linking chemicals and suppliers
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  chemical_id UUID NOT NULL REFERENCES chemicals(id) ON DELETE RESTRICT,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE RESTRICT,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  quantity NUMERIC(10,2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  location VARCHAR(255),
  lot_number VARCHAR(100),
  expiration_date DATE,
  date_added TIMESTAMP NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- RATE LIMITING TABLE
-- ============================================

-- Rate Limits: IP-based request tracking with hashed addresses for privacy
CREATE TABLE IF NOT EXISTS rate_limits (
  ip VARCHAR(64) PRIMARY KEY,
  request_count INT DEFAULT 0,
  window_start TIMESTAMP DEFAULT NOW()
);

-- Partial index for efficient cleanup of old entries (approaching limit)
CREATE INDEX IF NOT EXISTS rate_limits_window_start_idx
ON rate_limits (window_start)
WHERE request_count >= 40;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Inventory lookups
CREATE INDEX IF NOT EXISTS idx_inventory_chemical_id ON inventory(chemical_id);
CREATE INDEX IF NOT EXISTS idx_inventory_supplier_id ON inventory(supplier_id);
CREATE INDEX IF NOT EXISTS idx_inventory_created_by ON inventory(created_by);
CREATE INDEX IF NOT EXISTS idx_inventory_expiration_date ON inventory(expiration_date);

-- Supplier lookups
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);

-- Chemical lookups
CREATE INDEX IF NOT EXISTS idx_chemicals_name ON chemicals(chemical_name);
CREATE INDEX IF NOT EXISTS idx_chemicals_cid_number ON chemicals(cid_number);

-- ============================================
-- TABLE COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE chemicals IS 'Chemical compound definitions shared across inventory items';
COMMENT ON TABLE suppliers IS 'Supplier contact information shared across inventory items';
COMMENT ON TABLE inventory IS 'Main inventory items linking chemicals and suppliers with quantities and tracking';

COMMENT ON TABLE users IS 'User accounts for authentication (future use)';
COMMENT ON TABLE user_roles IS 'Role definitions for permission management (future use)';
COMMENT ON TABLE user_role_assignments IS 'Many-to-many mapping of users to roles (future use)';

COMMENT ON TABLE rate_limits IS 'Rate limiting table with SHA-256 hashed IP addresses for privacy';

COMMENT ON COLUMN rate_limits.ip IS 'SHA-256 hash of client IP address (PII protection)';
COMMENT ON COLUMN rate_limits.request_count IS 'Request count in current time window';
COMMENT ON COLUMN rate_limits.window_start IS 'Start of current rate limit time window';

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment the lines below to insert sample data for testing

-- INSERT INTO user_roles (name, description) VALUES
--   ('admin', 'Full system access'),
--   ('editor', 'Can create, update, delete inventory items'),
--   ('viewer', 'Read-only access to inventory');

-- INSERT INTO chemicals (chemical_name, cid_number, cas_number, hazard_class) VALUES
--   ('Acetone', '6574', '67-64-1', 'Flammable'),
--   ('Ethanol', '702', '64-17-5', 'Flammable');

-- INSERT INTO suppliers (name, contact_email) VALUES
--   ('Sigma-Aldrich', 'orders@sial.com'),
--   ('Fisher Scientific', 'orders@fisherSci.com');

-- ============================================
-- SETUP COMPLETE
-- ============================================

-- Verify all tables were created
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('chemicals', 'suppliers', 'inventory', 'users', 'user_roles', 'user_role_assignments', 'rate_limits')
ORDER BY tablename;
