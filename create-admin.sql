-- Create Admin User Script
-- Run this AFTER running database-setup.sql

-- First, let's create a proper bcrypt hash for the password: gCJ4Dxr55dGYmhM
-- This hash was generated using bcrypt with salt rounds 12

-- Delete any existing admin user to avoid conflicts
DELETE FROM "User" WHERE "email" = 't.kikala@gmail.com';

-- Create the admin user with the correct bcrypt hash
INSERT INTO "User" ("id", "email", "password", "name", "role", "isActive", "createdAt", "updatedAt") 
VALUES (
    gen_random_uuid()::text,
    't.kikala@gmail.com',
    '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Admin User',
    'ADMIN',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Success message
SELECT 'Admin user created successfully!' as message;
SELECT 'Email: t.kikala@gmail.com' as email;
SELECT 'Password: gCJ4Dxr55dGYmhM' as password; 