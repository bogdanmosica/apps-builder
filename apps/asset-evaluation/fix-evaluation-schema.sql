-- Add missing columns to evaluation_sessions table
-- This ensures the production database has all required columns

-- Add property information columns if they don't exist
DO $$ 
BEGIN
    -- Add property_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'evaluation_sessions' 
                  AND column_name = 'property_name') THEN
        ALTER TABLE evaluation_sessions ADD COLUMN property_name varchar(100);
    END IF;

    -- Add property_location column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'evaluation_sessions' 
                  AND column_name = 'property_location') THEN
        ALTER TABLE evaluation_sessions ADD COLUMN property_location varchar(255);
    END IF;

    -- Add property_surface column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'evaluation_sessions' 
                  AND column_name = 'property_surface') THEN
        ALTER TABLE evaluation_sessions ADD COLUMN property_surface integer;
    END IF;

    -- Add property_floors column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'evaluation_sessions' 
                  AND column_name = 'property_floors') THEN
        ALTER TABLE evaluation_sessions ADD COLUMN property_floors varchar(20);
    END IF;

    -- Add property_construction_year column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'evaluation_sessions' 
                  AND column_name = 'property_construction_year') THEN
        ALTER TABLE evaluation_sessions ADD COLUMN property_construction_year integer;
    END IF;
END $$;
