import { db } from './lib/db/drizzle';
import { sql } from 'drizzle-orm';

async function createContentTables() {
  try {
    console.log('Creating content management tables...');

    // Create content_categories table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "content_categories" (
        "id" serial PRIMARY KEY NOT NULL,
        "team_id" integer NOT NULL,
        "name" varchar(100) NOT NULL,
        "slug" varchar(100) NOT NULL,
        "description" text,
        "color" varchar(20) DEFAULT 'bg-blue-500',
        "sort_order" integer DEFAULT 0 NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )
    `);

    // Create content_posts table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "content_posts" (
        "id" serial PRIMARY KEY NOT NULL,
        "team_id" integer NOT NULL,
        "title" varchar(255) NOT NULL,
        "slug" varchar(255) NOT NULL,
        "content" text,
        "excerpt" text,
        "status" varchar(20) DEFAULT 'draft' NOT NULL,
        "author_id" integer NOT NULL,
        "category_id" integer,
        "tags" json DEFAULT '[]'::json,
        "featured_image" text,
        "is_featured" boolean DEFAULT false NOT NULL,
        "views" integer DEFAULT 0 NOT NULL,
        "published_at" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )
    `);

    // Create content_comments table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "content_comments" (
        "id" serial PRIMARY KEY NOT NULL,
        "post_id" integer NOT NULL,
        "author_name" varchar(100) NOT NULL,
        "author_email" varchar(255) NOT NULL,
        "content" text NOT NULL,
        "status" varchar(20) DEFAULT 'pending' NOT NULL,
        "parent_id" integer,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )
    `);

    // Create content_media table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "content_media" (
        "id" serial PRIMARY KEY NOT NULL,
        "team_id" integer NOT NULL,
        "name" varchar(255) NOT NULL,
        "original_name" varchar(255) NOT NULL,
        "mime_type" varchar(100) NOT NULL,
        "size" integer NOT NULL,
        "url" text NOT NULL,
        "thumbnail_url" text,
        "dimensions" varchar(20),
        "duration" integer,
        "uploaded_by" integer NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )
    `);

    console.log('Adding foreign key constraints...');

    // Add foreign key constraints
    await db.execute(sql`
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'content_categories_team_id_teams_id_fk') THEN
              ALTER TABLE "content_categories" ADD CONSTRAINT "content_categories_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE no action ON UPDATE no action;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'content_posts_team_id_teams_id_fk') THEN
              ALTER TABLE "content_posts" ADD CONSTRAINT "content_posts_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE no action ON UPDATE no action;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'content_posts_author_id_users_id_fk') THEN
              ALTER TABLE "content_posts" ADD CONSTRAINT "content_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'content_posts_category_id_content_categories_id_fk') THEN
              ALTER TABLE "content_posts" ADD CONSTRAINT "content_posts_category_id_content_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "content_categories"("id") ON DELETE no action ON UPDATE no action;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'content_comments_post_id_content_posts_id_fk') THEN
              ALTER TABLE "content_comments" ADD CONSTRAINT "content_comments_post_id_content_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "content_posts"("id") ON DELETE no action ON UPDATE no action;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'content_media_team_id_teams_id_fk') THEN
              ALTER TABLE "content_media" ADD CONSTRAINT "content_media_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE no action ON UPDATE no action;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'content_media_uploaded_by_users_id_fk') THEN
              ALTER TABLE "content_media" ADD CONSTRAINT "content_media_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
          END IF;
      END $$
    `);

    console.log('Inserting sample data...');

    // Insert sample categories
    await db.execute(sql`
      INSERT INTO "content_categories" ("team_id", "name", "slug", "description", "color", "sort_order") 
      VALUES
      (1, 'Development', 'development', 'Software development and programming topics', 'bg-blue-500', 1),
      (1, 'Design', 'design', 'UI/UX design and visual content', 'bg-purple-500', 2),
      (1, 'AI', 'ai', 'Artificial Intelligence and Machine Learning', 'bg-green-500', 3),
      (1, 'Performance', 'performance', 'Web performance and optimization', 'bg-orange-500', 4),
      (1, 'Security', 'security', 'Web security and best practices', 'bg-red-500', 5)
      ON CONFLICT DO NOTHING
    `);

    // Insert sample posts
    await db.execute(sql`
      INSERT INTO "content_posts" ("team_id", "title", "slug", "content", "excerpt", "status", "author_id", "category_id", "tags", "is_featured", "views", "published_at") 
      VALUES
      (1, 'How to Build Scalable Web Applications', 'how-to-build-scalable-web-applications', 'Learn the fundamentals of building scalable web applications with modern frameworks and best practices...', 'Learn the fundamentals of building scalable web applications...', 'published', 1, 1, '["React", "Next.js", "Architecture"]'::json, true, 1247, NOW() - INTERVAL '2 days'),
      (1, 'The Future of AI in Web Development', 'future-of-ai-web-development', 'Exploring how artificial intelligence will transform the way we build web applications...', 'Exploring how artificial intelligence will transform...', 'draft', 1, 3, '["AI", "Machine Learning", "Web Development"]'::json, false, 0, NULL),
      (1, 'Best Practices for React Performance', 'react-performance-best-practices', 'Optimize your React applications with these proven techniques and strategies...', 'Optimize your React applications with these proven techniques...', 'published', 1, 4, '["React", "Performance", "Optimization"]'::json, false, 892, NOW() - INTERVAL '5 days')
      ON CONFLICT DO NOTHING
    `);

    // Insert sample comments
    await db.execute(sql`
      INSERT INTO "content_comments" ("post_id", "author_name", "author_email", "content", "status") 
      VALUES
      (1, 'Jane Smith', 'jane@example.com', 'Great article! Very helpful insights on building scalable applications.', 'approved'),
      (1, 'Mike Johnson', 'mike@example.com', 'Thanks for sharing these best practices. The architecture section was particularly useful.', 'approved'),
      (3, 'Sarah Wilson', 'sarah@example.com', 'Excellent performance tips! I implemented some of these and saw immediate improvements.', 'approved')
      ON CONFLICT DO NOTHING
    `);

    // Insert sample media files
    await db.execute(sql`
      INSERT INTO "content_media" ("team_id", "name", "original_name", "mime_type", "size", "url", "dimensions", "uploaded_by") 
      VALUES
      (1, 'hero-image-2024.jpg', 'hero-image-2024.jpg', 'image/jpeg', 2516582, '/media/hero-image-2024.jpg', '1920x1080', 1),
      (1, 'tutorial-video.mp4', 'tutorial-video.mp4', 'video/mp4', 47923814, '/media/tutorial-video.mp4', '1280x720', 1),
      (1, 'documentation.pdf', 'documentation.pdf', 'application/pdf', 1258291, '/media/documentation.pdf', NULL, 1)
      ON CONFLICT DO NOTHING
    `);

    console.log('Content management tables created successfully!');
  } catch (error) {
    console.error('Error creating content tables:', error);
  }
}

createContentTables();
