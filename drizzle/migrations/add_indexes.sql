-- Database Indexing for Performance Optimization
-- Add indexes on frequently queried columns

-- User table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Preventive table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_preventive_user_id ON preventive(user_id);
CREATE INDEX IF NOT EXISTS idx_preventive_created_at ON preventive(created_at);
CREATE INDEX IF NOT EXISTS idx_preventive_status ON preventive(status);

-- Project table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_project_user_id ON project(user_id);
CREATE INDEX IF NOT EXISTS idx_project_created_at ON project(created_at);
CREATE INDEX IF NOT EXISTS idx_project_status ON project(status);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_preventive_user_date ON preventive(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_user_date ON project(user_id, created_at DESC);
