import { db } from './drizzle';
import { 
  contentPosts, 
  contentCategories, 
  contentMedia, 
  contentComments,
  users,
  teams,
  type ContentPost,
  type ContentCategory,
  type ContentMedia,
  type User
} from './schema';
import { eq, desc, count, sql, and, or, like, isNull } from 'drizzle-orm';

// Type for post data from specific query
type PostData = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  tags: string[] | null;
  isFeatured: boolean;
  views: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: number;
    name: string | null;
    email: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
};

// Type for recent post data from activity query
type RecentPostData = {
  id: number;
  title: string;
  status: string;
  author: string | null;
  timestamp: Date;
  type: string;
};

// Type for recent comment data from activity query  
type RecentCommentData = {
  id: number;
  title: string;
  content: string;
  author: string | null;
  timestamp: Date;
  type: string;
};

// Content Posts Queries
export async function getContentPosts(teamId: number, filters?: {
  status?: string;
  categoryId?: number;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  // Build where conditions
  const conditions = [eq(contentPosts.teamId, teamId)];

  if (filters?.status && filters.status !== 'all') {
    conditions.push(eq(contentPosts.status, filters.status));
  }

  if (filters?.categoryId) {
    conditions.push(eq(contentPosts.categoryId, filters.categoryId));
  }

  if (filters?.search) {
    conditions.push(
      or(
        like(contentPosts.title, `%${filters.search}%`),
        like(contentPosts.excerpt, `%${filters.search}%`)
      )!
    );
  }

  const posts = await db
    .select({
      id: contentPosts.id,
      title: contentPosts.title,
      slug: contentPosts.slug,
      excerpt: contentPosts.excerpt,
      status: contentPosts.status,
      tags: contentPosts.tags,
      isFeatured: contentPosts.isFeatured,
      views: contentPosts.views,
      publishedAt: contentPosts.publishedAt,
      createdAt: contentPosts.createdAt,
      updatedAt: contentPosts.updatedAt,
      author: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
      category: {
        id: contentCategories.id,
        name: contentCategories.name,
        color: contentCategories.color,
      },
    })
    .from(contentPosts)
    .leftJoin(users, eq(contentPosts.authorId, users.id))
    .leftJoin(contentCategories, eq(contentPosts.categoryId, contentCategories.id))
    .where(and(...conditions))
    .orderBy(desc(contentPosts.createdAt))
    .limit(filters?.limit || 100)
    .offset(filters?.offset || 0);

  // Get comment counts separately
  const postsWithComments = await Promise.all(
    posts.map(async (post: PostData) => {
      const commentCount = await db
        .select({ count: count() })
        .from(contentComments)
        .where(and(
          eq(contentComments.postId, post.id),
          eq(contentComments.status, 'approved')
        ));
      
      return {
        ...post,
        commentCount: commentCount[0]?.count || 0,
      };
    })
  );

  return postsWithComments;
}

export async function getContentPostById(postId: number, teamId: number) {
  const result = await db
    .select({
      id: contentPosts.id,
      title: contentPosts.title,
      slug: contentPosts.slug,
      content: contentPosts.content,
      excerpt: contentPosts.excerpt,
      status: contentPosts.status,
      tags: contentPosts.tags,
      featuredImage: contentPosts.featuredImage,
      isFeatured: contentPosts.isFeatured,
      views: contentPosts.views,
      publishedAt: contentPosts.publishedAt,
      createdAt: contentPosts.createdAt,
      updatedAt: contentPosts.updatedAt,
      author: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
      category: {
        id: contentCategories.id,
        name: contentCategories.name,
        color: contentCategories.color,
      },
    })
    .from(contentPosts)
    .leftJoin(users, eq(contentPosts.authorId, users.id))
    .leftJoin(contentCategories, eq(contentPosts.categoryId, contentCategories.id))
    .where(and(
      eq(contentPosts.id, postId),
      eq(contentPosts.teamId, teamId)
    ))
    .limit(1);

  return result[0] || null;
}

export async function createContentPost(data: {
  teamId: number;
  authorId: number;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  status?: string;
  categoryId?: number;
  tags?: string[];
  featuredImage?: string;
  isFeatured?: boolean;
}) {
  const result = await db
    .insert(contentPosts)
    .values({
      teamId: data.teamId,
      authorId: data.authorId,
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      status: data.status || 'draft',
      categoryId: data.categoryId,
      tags: data.tags || [],
      featuredImage: data.featuredImage,
      isFeatured: data.isFeatured || false,
    })
    .returning();

  return result[0];
}

export async function updateContentPost(postId: number, teamId: number, data: Partial<{
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: string;
  categoryId: number;
  tags: string[];
  featuredImage: string;
  isFeatured: boolean;
  publishedAt: Date;
}>) {
  const result = await db
    .update(contentPosts)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(
      eq(contentPosts.id, postId),
      eq(contentPosts.teamId, teamId)
    ))
    .returning();

  return result[0] || null;
}

export async function deleteContentPost(postId: number, teamId: number) {
  const result = await db
    .delete(contentPosts)
    .where(and(
      eq(contentPosts.id, postId),
      eq(contentPosts.teamId, teamId)
    ))
    .returning();

  return result[0] || null;
}

export async function incrementPostViews(postId: number) {
  await db
    .update(contentPosts)
    .set({
      views: sql`${contentPosts.views} + 1`,
    })
    .where(eq(contentPosts.id, postId));
}

// Content Categories Queries
export async function getContentCategories(teamId: number) {
  const categories = await db
    .select({
      id: contentCategories.id,
      name: contentCategories.name,
      slug: contentCategories.slug,
      description: contentCategories.description,
      color: contentCategories.color,
      sortOrder: contentCategories.sortOrder,
      isActive: contentCategories.isActive,
      createdAt: contentCategories.createdAt,
      updatedAt: contentCategories.updatedAt,
      postCount: count(contentPosts.id),
    })
    .from(contentCategories)
    .leftJoin(contentPosts, and(
      eq(contentPosts.categoryId, contentCategories.id),
      eq(contentPosts.status, 'published')
    ))
    .where(eq(contentCategories.teamId, teamId))
    .groupBy(contentCategories.id)
    .orderBy(contentCategories.sortOrder, contentCategories.name);

  return categories;
}

export async function createContentCategory(data: {
  teamId: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  sortOrder?: number;
}) {
  const result = await db
    .insert(contentCategories)
    .values(data)
    .returning();

  return result[0];
}

export async function updateContentCategory(categoryId: number, teamId: number, data: Partial<{
  name: string;
  slug: string;
  description: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
}>) {
  const result = await db
    .update(contentCategories)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(
      eq(contentCategories.id, categoryId),
      eq(contentCategories.teamId, teamId)
    ))
    .returning();

  return result[0] || null;
}

export async function deleteContentCategory(categoryId: number, teamId: number) {
  // First, update all posts to remove the category reference
  await db
    .update(contentPosts)
    .set({ categoryId: null })
    .where(eq(contentPosts.categoryId, categoryId));

  // Then delete the category
  const result = await db
    .delete(contentCategories)
    .where(and(
      eq(contentCategories.id, categoryId),
      eq(contentCategories.teamId, teamId)
    ))
    .returning();

  return result[0] || null;
}

// Content Media Queries
export async function getContentMedia(teamId: number, filters?: {
  search?: string;
  mimeType?: string;
  limit?: number;
  offset?: number;
}) {
  // Build where conditions
  const conditions = [eq(contentMedia.teamId, teamId)];

  if (filters?.search) {
    conditions.push(
      or(
        like(contentMedia.name, `%${filters.search}%`),
        like(contentMedia.originalName, `%${filters.search}%`)
      )!
    );
  }

  if (filters?.mimeType) {
    conditions.push(like(contentMedia.mimeType, `${filters.mimeType}%`));
  }

  const media = await db
    .select({
      id: contentMedia.id,
      name: contentMedia.name,
      originalName: contentMedia.originalName,
      mimeType: contentMedia.mimeType,
      size: contentMedia.size,
      url: contentMedia.url,
      thumbnailUrl: contentMedia.thumbnailUrl,
      dimensions: contentMedia.dimensions,
      duration: contentMedia.duration,
      createdAt: contentMedia.createdAt,
      updatedAt: contentMedia.updatedAt,
      uploadedBy: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(contentMedia)
    .leftJoin(users, eq(contentMedia.uploadedBy, users.id))
    .where(and(...conditions))
    .orderBy(desc(contentMedia.createdAt))
    .limit(filters?.limit || 100)
    .offset(filters?.offset || 0);

  return media;
}

export async function createContentMedia(data: {
  teamId: number;
  uploadedBy: number;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  dimensions?: string;
  duration?: number;
}) {
  const result = await db
    .insert(contentMedia)
    .values(data)
    .returning();

  return result[0];
}

export async function deleteContentMedia(mediaId: number, teamId: number) {
  const result = await db
    .delete(contentMedia)
    .where(and(
      eq(contentMedia.id, mediaId),
      eq(contentMedia.teamId, teamId)
    ))
    .returning();

  return result[0] || null;
}

// Content Stats Queries
export async function getContentStats(teamId: number) {
  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    totalViews,
    totalComments,
    totalCategories,
  ] = await Promise.all([
    // Total posts
    db
      .select({ count: count() })
      .from(contentPosts)
      .where(eq(contentPosts.teamId, teamId))
      .then((result: { count: number }[]) => result[0]?.count || 0),
    
    // Published posts
    db
      .select({ count: count() })
      .from(contentPosts)
      .where(and(
        eq(contentPosts.teamId, teamId),
        eq(contentPosts.status, 'published')
      ))
      .then((result: { count: number }[]) => result[0]?.count || 0),
    
    // Draft posts
    db
      .select({ count: count() })
      .from(contentPosts)
      .where(and(
        eq(contentPosts.teamId, teamId),
        eq(contentPosts.status, 'draft')
      ))
      .then((result: { count: number }[]) => result[0]?.count || 0),
    
    // Total views
    db
      .select({ total: sql<number>`COALESCE(SUM(${contentPosts.views}), 0)` })
      .from(contentPosts)
      .where(eq(contentPosts.teamId, teamId))
      .then((result: { total: number }[]) => result[0]?.total || 0),
    
    // Total comments
    db
      .select({ count: count() })
      .from(contentComments)
      .leftJoin(contentPosts, eq(contentComments.postId, contentPosts.id))
      .where(and(
        eq(contentPosts.teamId, teamId),
        eq(contentComments.status, 'approved')
      ))
      .then((result: { count: number }[]) => result[0]?.count || 0),
    
    // Total categories
    db
      .select({ count: count() })
      .from(contentCategories)
      .where(and(
        eq(contentCategories.teamId, teamId),
        eq(contentCategories.isActive, true)
      ))
      .then((result: { count: number }[]) => result[0]?.count || 0),
  ]);

  return {
    totalPosts,
    publishedPosts,
    draftPosts,
    totalViews,
    totalComments,
    totalCategories,
  };
}

// Recent Activity Query
export async function getRecentContentActivity(teamId: number, limit: number = 10) {
  // Get recent posts
  const recentPosts = await db
    .select({
      id: contentPosts.id,
      title: contentPosts.title,
      status: contentPosts.status,
      author: users.name,
      timestamp: contentPosts.createdAt,
      type: sql<string>`'post_created'`,
    })
    .from(contentPosts)
    .leftJoin(users, eq(contentPosts.authorId, users.id))
    .where(eq(contentPosts.teamId, teamId))
    .orderBy(desc(contentPosts.createdAt))
    .limit(limit);

  // Get recent comments
  const recentComments = await db
    .select({
      id: contentComments.id,
      title: contentPosts.title,
      content: contentComments.content,
      author: contentComments.authorName,
      timestamp: contentComments.createdAt,
      type: sql<string>`'comment_added'`,
    })
    .from(contentComments)
    .leftJoin(contentPosts, eq(contentComments.postId, contentPosts.id))
    .where(and(
      eq(contentPosts.teamId, teamId),
      eq(contentComments.status, 'approved')
    ))
    .orderBy(desc(contentComments.createdAt))
    .limit(limit);

  // Combine and sort by timestamp
  const allActivity = [
    ...recentPosts.map((post: RecentPostData) => ({
      id: post.id,
      type: 'post_created' as const,
      title: post.status === 'published' ? 'New blog post published' : 'New draft created',
      description: post.title,
      user: post.author || 'Unknown',
      timestamp: post.timestamp,
    })),
    ...recentComments.map((comment: RecentCommentData) => ({
      id: comment.id,
      type: 'comment_added' as const,
      title: 'New comment on post',
      description: comment.content?.substring(0, 100) + '...' || '',
      user: comment.author,
      timestamp: comment.timestamp,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);

  return allActivity;
}
