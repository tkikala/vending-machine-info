DO $$ DECLARE
    r RECORD;
BEGIN
    -- Drop all foreign key constraints
    FOR r IN (SELECT c.relname as tablename, conname FROM pg_constraint JOIN pg_class c ON conrelid=c.oid WHERE contype = 'f') LOOP
        EXECUTE 'ALTER TABLE "' || r.tablename || '" DROP CONSTRAINT IF EXISTS "' || r.conname || '"';
    END LOOP;
    -- Drop all tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS "' || r.tablename || '" CASCADE';
    END LOOP;
END $$; 