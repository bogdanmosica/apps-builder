-- Manual migration script to update existing data for i18n support
-- Run this before the automatic migration

-- First, add the new columns as nullable
ALTER TABLE property_types ADD COLUMN IF NOT EXISTS name_ro text;
ALTER TABLE property_types ADD COLUMN IF NOT EXISTS name_en text;

ALTER TABLE question_categories ADD COLUMN IF NOT EXISTS name_ro text;
ALTER TABLE question_categories ADD COLUMN IF NOT EXISTS name_en text;

ALTER TABLE questions ADD COLUMN IF NOT EXISTS text_ro text;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS text_en text;

ALTER TABLE answers ADD COLUMN IF NOT EXISTS text_ro text;
ALTER TABLE answers ADD COLUMN IF NOT EXISTS text_en text;

-- Update existing data with Romanian as default
UPDATE property_types SET name_ro = name WHERE name_ro IS NULL;
UPDATE question_categories SET name_ro = name WHERE name_ro IS NULL;
UPDATE questions SET text_ro = text WHERE text_ro IS NULL;
UPDATE answers SET text_ro = text WHERE text_ro IS NULL;

-- Now we can make the Romanian columns NOT NULL
ALTER TABLE property_types ALTER COLUMN name_ro SET NOT NULL;
ALTER TABLE question_categories ALTER COLUMN name_ro SET NOT NULL;
ALTER TABLE questions ALTER COLUMN text_ro SET NOT NULL;
ALTER TABLE answers ALTER COLUMN text_ro SET NOT NULL;

-- Drop the old columns
ALTER TABLE property_types DROP COLUMN IF EXISTS name;
ALTER TABLE question_categories DROP COLUMN IF EXISTS name;
ALTER TABLE questions DROP COLUMN IF EXISTS text;
ALTER TABLE answers DROP COLUMN IF EXISTS text;
