-- Add property information columns to evaluation_sessions table
ALTER TABLE evaluation_sessions ADD COLUMN property_name VARCHAR(100);
ALTER TABLE evaluation_sessions ADD COLUMN property_location VARCHAR(255);
ALTER TABLE evaluation_sessions ADD COLUMN property_surface INTEGER;
ALTER TABLE evaluation_sessions ADD COLUMN property_floors VARCHAR(20);
ALTER TABLE evaluation_sessions ADD COLUMN property_construction_year INTEGER;
