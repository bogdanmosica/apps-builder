import { sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  integer,
  json,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: serial().primaryKey().notNull(),
    teamId: integer("team_id").notNull(),
    userId: integer("user_id").notNull(),
    planName: varchar("plan_name", { length: 50 }).notNull(),
    status: varchar({ length: 20 }).default("active").notNull(),
    amount: integer().notNull(),
    currency: varchar({ length: 3 }).default("usd").notNull(),
    billingPeriod: varchar("billing_period", { length: 20 })
      .default("monthly")
      .notNull(),
    stripeSubscriptionId: text("stripe_subscription_id"),
    currentPeriodStart: timestamp("current_period_start", {
      mode: "string",
    }).notNull(),
    currentPeriodEnd: timestamp("current_period_end", {
      mode: "string",
    }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "subscriptions_team_id_teams_id_fk",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "subscriptions_user_id_users_id_fk",
    }),
    unique("subscriptions_stripe_subscription_id_unique").on(
      table.stripeSubscriptionId,
    ),
  ],
);

export const teams = pgTable(
  "teams",
  {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 100 }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    stripeProductId: text("stripe_product_id"),
    planName: varchar("plan_name", { length: 50 }),
    subscriptionStatus: varchar("subscription_status", { length: 20 }),
  },
  (table) => [
    unique("teams_stripe_customer_id_unique").on(table.stripeCustomerId),
    unique("teams_stripe_subscription_id_unique").on(
      table.stripeSubscriptionId,
    ),
  ],
);

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: serial().primaryKey().notNull(),
    teamId: integer("team_id").notNull(),
    userId: integer("user_id"),
    action: text().notNull(),
    timestamp: timestamp({ mode: "string" }).defaultNow().notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
  },
  (table) => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "activity_logs_team_id_teams_id_fk",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "activity_logs_user_id_users_id_fk",
    }),
  ],
);

export const users = pgTable(
  "users",
  {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 100 }),
    email: varchar({ length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: varchar({ length: 20 }).default("member").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
  },
  (table) => [unique("users_email_unique").on(table.email)],
);

export const invitations = pgTable(
  "invitations",
  {
    id: serial().primaryKey().notNull(),
    teamId: integer("team_id").notNull(),
    email: varchar({ length: 255 }).notNull(),
    role: varchar({ length: 50 }).notNull(),
    invitedBy: integer("invited_by").notNull(),
    invitedAt: timestamp("invited_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    status: varchar({ length: 20 }).default("pending").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "invitations_team_id_teams_id_fk",
    }),
    foreignKey({
      columns: [table.invitedBy],
      foreignColumns: [users.id],
      name: "invitations_invited_by_users_id_fk",
    }),
  ],
);

export const teamMembers = pgTable(
  "team_members",
  {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id").notNull(),
    teamId: integer("team_id").notNull(),
    role: varchar({ length: 50 }).notNull(),
    joinedAt: timestamp("joined_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "team_members_user_id_users_id_fk",
    }),
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "team_members_team_id_teams_id_fk",
    }),
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: serial().primaryKey().notNull(),
    teamId: integer("team_id").notNull(),
    userId: integer("user_id").notNull(),
    subscriptionId: integer("subscription_id"),
    amount: integer().notNull(),
    currency: varchar({ length: 3 }).default("usd").notNull(),
    status: varchar({ length: 20 }).default("completed").notNull(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    description: text(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "payments_team_id_teams_id_fk",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "payments_user_id_users_id_fk",
    }),
    foreignKey({
      columns: [table.subscriptionId],
      foreignColumns: [subscriptions.id],
      name: "payments_subscription_id_subscriptions_id_fk",
    }),
    unique("payments_stripe_payment_intent_id_unique").on(
      table.stripePaymentIntentId,
    ),
  ],
);

export const userSessions = pgTable(
  "user_sessions",
  {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id").notNull(),
    teamId: integer("team_id").notNull(),
    startTime: timestamp("start_time", { mode: "string" })
      .defaultNow()
      .notNull(),
    endTime: timestamp("end_time", { mode: "string" }),
    duration: integer(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "user_sessions_user_id_users_id_fk",
    }),
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "user_sessions_team_id_teams_id_fk",
    }),
  ],
);

export const products = pgTable(
  "products",
  {
    id: serial().primaryKey().notNull(),
    teamId: integer("team_id").notNull(),
    name: varchar({ length: 100 }).notNull(),
    description: text(),
    price: integer().notNull(),
    currency: varchar({ length: 3 }).default("usd").notNull(),
    billingPeriod: varchar("billing_period", { length: 20 })
      .default("monthly")
      .notNull(),
    isActive: varchar("is_active", { length: 10 }).default("true").notNull(),
    stripeProductId: text("stripe_product_id"),
    stripePriceId: text("stripe_price_id"),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "products_team_id_teams_id_fk",
    }),
    unique("products_stripe_product_id_unique").on(table.stripeProductId),
    unique("products_stripe_price_id_unique").on(table.stripePriceId),
  ],
);

export const pricingPlans = pgTable(
  "pricing_plans",
  {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 100 }).notNull(),
    description: text(),
    price: integer().notNull(),
    currency: varchar({ length: 3 }).default("usd").notNull(),
    billingPeriod: varchar("billing_period", { length: 20 })
      .default("monthly")
      .notNull(),
    features: text().notNull(),
    isPopular: varchar("is_popular", { length: 10 }).default("false").notNull(),
    isActive: varchar("is_active", { length: 10 }).default("true").notNull(),
    stripePriceId: text("stripe_price_id"),
    stripeProductId: text("stripe_product_id"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("pricing_plans_stripe_price_id_unique").on(table.stripePriceId),
    unique("pricing_plans_stripe_product_id_unique").on(table.stripeProductId),
  ],
);

export const webhooks = pgTable(
  "webhooks",
  {
    id: serial().primaryKey().notNull(),
    teamId: integer("team_id").notNull(),
    integrationId: integer("integration_id"),
    name: varchar({ length: 100 }).notNull(),
    url: text().notNull(),
    events: json().notNull(),
    status: varchar({ length: 20 }).default("active").notNull(),
    secret: text(),
    retries: integer().default(3).notNull(),
    timeout: integer().default(30).notNull(),
    lastTriggered: timestamp("last_triggered", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "webhooks_team_id_teams_id_fk",
    }),
    foreignKey({
      columns: [table.integrationId],
      foreignColumns: [integrations.id],
      name: "webhooks_integration_id_integrations_id_fk",
    }),
  ],
);

export const communicationStats = pgTable(
  "communication_stats",
  {
    id: serial().primaryKey().notNull(),
    teamId: integer("team_id").notNull(),
    date: timestamp({ mode: "string" }).defaultNow().notNull(),
    totalConversations: integer("total_conversations").default(0).notNull(),
    activeConversations: integer("active_conversations").default(0).notNull(),
    newConversations: integer("new_conversations").default(0).notNull(),
    closedConversations: integer("closed_conversations").default(0).notNull(),
    unreadMessages: integer("unread_messages").default(0).notNull(),
    totalMessages: integer("total_messages").default(0).notNull(),
    activeUsers: integer("active_users").default(0).notNull(),
    avgResponseTime: integer("avg_response_time").default(0).notNull(),
    satisfactionRate: numeric("satisfaction_rate", {
      precision: 5,
      scale: 2,
    }).default("0.00"),
    ticketsResolved: integer("tickets_resolved").default(0).notNull(),
    campaignsSent: integer("campaigns_sent").default(0).notNull(),
    emailsDelivered: integer("emails_delivered").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "communication_stats_team_id_teams_id_fk",
    }),
  ],
);

export const apiKeys = pgTable(
  "api_keys",
  {
    id: serial().primaryKey().notNull(),
    teamId: integer("team_id").notNull(),
    name: varchar({ length: 100 }).notNull(),
    description: text(),
    keyHash: text("key_hash").notNull(),
    permissions: json().notNull(),
    environment: varchar({ length: 20 }).default("production").notNull(),
    status: varchar({ length: 20 }).default("active").notNull(),
    rateLimit: integer("rate_limit").default(1000).notNull(),
    lastUsed: timestamp("last_used", { mode: "string" }),
    expiresAt: timestamp("expires_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "api_keys_team_id_teams_id_fk",
    }),
  ],
);

export const apiRequests = pgTable(
  "api_requests",
  {
    id: serial().primaryKey().notNull(),
    teamId: integer("team_id").notNull(),
    integrationId: integer("integration_id"),
    endpoint: varchar({ length: 255 }).notNull(),
    method: varchar({ length: 10 }).notNull(),
    statusCode: integer("status_code").notNull(),
    responseTime: integer("response_time").notNull(),
    requestSize: integer("request_size"),
    responseSize: integer("response_size"),
    userAgent: text("user_agent"),
    ipAddress: varchar("ip_address", { length: 45 }),
    timestamp: timestamp({ mode: "string" }).defaultNow().notNull(),
    isSuccess: boolean("is_success").default(true).notNull(),
    errorMessage: text("error_message"),
  },
  (table) => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "api_requests_team_id_teams_id_fk",
    }),
    foreignKey({
      columns: [table.integrationId],
      foreignColumns: [integrations.id],
      name: "api_requests_integration_id_integrations_id_fk",
    }),
  ],
);

export const integrations = pgTable(
  "integrations",
  {
    id: serial().primaryKey().notNull(),
    teamId: integer("team_id").notNull(),
    name: varchar({ length: 100 }).notNull(),
    description: text(),
    category: varchar({ length: 50 }).notNull(),
    status: varchar({ length: 20 }).default("disconnected").notNull(),
    health: varchar({ length: 20 }).default("unknown").notNull(),
    dataFlow: varchar("data_flow", { length: 20 })
      .default("bidirectional")
      .notNull(),
    config: json().default({}),
    credentials: json().default({}),
    lastSync: timestamp("last_sync", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "integrations_team_id_teams_id_fk",
    }),
  ],
);

export const webhookDeliveries = pgTable(
  "webhook_deliveries",
  {
    id: serial().primaryKey().notNull(),
    webhookId: integer("webhook_id").notNull(),
    teamId: integer("team_id").notNull(),
    event: varchar({ length: 100 }).notNull(),
    payload: json().notNull(),
    statusCode: integer("status_code"),
    responseTime: integer("response_time"),
    attempts: integer().default(1).notNull(),
    isSuccess: boolean("is_success").default(false).notNull(),
    errorMessage: text("error_message"),
    timestamp: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.webhookId],
      foreignColumns: [webhooks.id],
      name: "webhook_deliveries_webhook_id_webhooks_id_fk",
    }),
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "webhook_deliveries_team_id_teams_id_fk",
    }),
  ],
);

export const campaigns = pgTable(
  "campaigns",
  {
    id: serial().primaryKey().notNull(),
    teamId: integer("team_id").notNull(),
    name: varchar({ length: 200 }).notNull(),
    description: text(),
    type: varchar({ length: 20 }).default("email").notNull(),
    status: varchar({ length: 20 }).default("draft").notNull(),
    templateId: integer("template_id"),
    recipientCount: integer("recipient_count").default(0).notNull(),
    sentCount: integer("sent_count").default(0).notNull(),
    openCount: integer("open_count").default(0).notNull(),
    clickCount: integer("click_count").default(0).notNull(),
    responseCount: integer("response_count").default(0).notNull(),
    openRate: numeric("open_rate", { precision: 5, scale: 2 }).default("0.00"),
    clickRate: numeric("click_rate", { precision: 5, scale: 2 }).default(
      "0.00",
    ),
    responseRate: numeric("response_rate", { precision: 5, scale: 2 }).default(
      "0.00",
    ),
    scheduledAt: timestamp("scheduled_at", { mode: "string" }),
    sentAt: timestamp("sent_at", { mode: "string" }),
    createdBy: integer("created_by").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "campaigns_team_id_teams_id_fk",
    }),
    foreignKey({
      columns: [table.templateId],
      foreignColumns: [communicationTemplates.id],
      name: "campaigns_template_id_communication_templates_id_fk",
    }),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "campaigns_created_by_users_id_fk",
    }),
  ],
);

export const communicationTemplates = pgTable(
  "communication_templates",
  {
    id: serial().primaryKey().notNull(),
    teamId: integer("team_id").notNull(),
    name: varchar({ length: 100 }).notNull(),
    description: text(),
    type: varchar({ length: 20 }).default("email").notNull(),
    category: varchar({ length: 50 }).notNull(),
    subject: varchar({ length: 255 }),
    content: text().notNull(),
    variables: json().default([]),
    usageCount: integer("usage_count").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdBy: integer("created_by").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "communication_templates_team_id_teams_id_fk",
    }),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "communication_templates_created_by_users_id_fk",
    }),
  ],
);

export const conversations = pgTable(
  "conversations",
  {
    id: serial().primaryKey().notNull(),
    teamId: integer("team_id").notNull(),
    participantName: varchar("participant_name", { length: 100 }).notNull(),
    participantEmail: varchar("participant_email", { length: 255 }).notNull(),
    participantAvatar: text("participant_avatar"),
    lastMessage: text("last_message"),
    lastMessageAt: timestamp("last_message_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    unreadCount: integer("unread_count").default(0).notNull(),
    status: varchar({ length: 20 }).default("active").notNull(),
    participantStatus: varchar("participant_status", { length: 20 })
      .default("offline")
      .notNull(),
    type: varchar({ length: 20 }).default("support").notNull(),
    priority: varchar({ length: 10 }).default("medium").notNull(),
    assignedTo: integer("assigned_to"),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "conversations_team_id_teams_id_fk",
    }),
    foreignKey({
      columns: [table.assignedTo],
      foreignColumns: [users.id],
      name: "conversations_assigned_to_users_id_fk",
    }),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: serial().primaryKey().notNull(),
    conversationId: integer("conversation_id").notNull(),
    teamId: integer("team_id").notNull(),
    senderId: integer("sender_id"),
    senderName: varchar("sender_name", { length: 100 }).notNull(),
    senderEmail: varchar("sender_email", { length: 255 }).notNull(),
    content: text().notNull(),
    messageType: varchar("message_type", { length: 20 })
      .default("text")
      .notNull(),
    attachments: json().default([]),
    isRead: boolean("is_read").default(false).notNull(),
    isFromParticipant: boolean("is_from_participant").default(true).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.conversationId],
      foreignColumns: [conversations.id],
      name: "messages_conversation_id_conversations_id_fk",
    }),
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "messages_team_id_teams_id_fk",
    }),
    foreignKey({
      columns: [table.senderId],
      foreignColumns: [users.id],
      name: "messages_sender_id_users_id_fk",
    }),
  ],
);

export const notifications = pgTable(
  "notifications",
  {
    id: serial().primaryKey().notNull(),
    teamId: integer("team_id").notNull(),
    userId: integer("user_id"),
    title: varchar({ length: 200 }).notNull(),
    description: text(),
    type: varchar({ length: 20 }).default("info").notNull(),
    priority: varchar({ length: 10 }).default("medium").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    actionUrl: text("action_url"),
    metadata: json().default({}),
    expiresAt: timestamp("expires_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "notifications_team_id_teams_id_fk",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "notifications_user_id_users_id_fk",
    }),
  ],
);

export const contentComments = pgTable(
  "content_comments",
  {
    id: serial().primaryKey().notNull(),
    postId: integer("post_id").notNull(),
    authorName: varchar("author_name", { length: 100 }).notNull(),
    authorEmail: varchar("author_email", { length: 255 }).notNull(),
    content: text().notNull(),
    status: varchar({ length: 20 }).default("pending").notNull(),
    parentId: integer("parent_id"),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.postId],
      foreignColumns: [contentPosts.id],
      name: "content_comments_post_id_content_posts_id_fk",
    }),
  ],
);

export const contentCategories = pgTable(
  "content_categories",
  {
    id: serial().primaryKey().notNull(),
    teamId: integer("team_id").notNull(),
    name: varchar({ length: 100 }).notNull(),
    slug: varchar({ length: 100 }).notNull(),
    description: text(),
    color: varchar({ length: 20 }).default("bg-blue-500"),
    sortOrder: integer("sort_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "content_categories_team_id_teams_id_fk",
    }),
  ],
);

export const contentPosts = pgTable(
  "content_posts",
  {
    id: serial().primaryKey().notNull(),
    teamId: integer("team_id").notNull(),
    title: varchar({ length: 255 }).notNull(),
    slug: varchar({ length: 255 }).notNull(),
    content: text(),
    excerpt: text(),
    status: varchar({ length: 20 }).default("draft").notNull(),
    authorId: integer("author_id").notNull(),
    categoryId: integer("category_id"),
    tags: json().default([]),
    featuredImage: text("featured_image"),
    isFeatured: boolean("is_featured").default(false).notNull(),
    views: integer().default(0).notNull(),
    publishedAt: timestamp("published_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "content_posts_team_id_teams_id_fk",
    }),
    foreignKey({
      columns: [table.authorId],
      foreignColumns: [users.id],
      name: "content_posts_author_id_users_id_fk",
    }),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [contentCategories.id],
      name: "content_posts_category_id_content_categories_id_fk",
    }),
  ],
);

export const contentMedia = pgTable(
  "content_media",
  {
    id: serial().primaryKey().notNull(),
    teamId: integer("team_id").notNull(),
    name: varchar({ length: 255 }).notNull(),
    originalName: varchar("original_name", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    size: integer().notNull(),
    url: text().notNull(),
    thumbnailUrl: text("thumbnail_url"),
    dimensions: varchar({ length: 20 }),
    duration: integer(),
    uploadedBy: integer("uploaded_by").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "content_media_team_id_teams_id_fk",
    }),
    foreignKey({
      columns: [table.uploadedBy],
      foreignColumns: [users.id],
      name: "content_media_uploaded_by_users_id_fk",
    }),
  ],
);

export const userProfiles = pgTable(
  "user_profiles",
  {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id").notNull(),
    firstName: varchar("first_name", { length: 50 }),
    lastName: varchar("last_name", { length: 50 }),
    bio: text(),
    avatar: text(),
    phone: varchar({ length: 20 }),
    timezone: varchar({ length: 50 }).default("UTC"),
    language: varchar({ length: 10 }).default("en"),
    companyName: varchar("company_name", { length: 100 }),
    companyWebsite: text("company_website"),
    jobTitle: varchar("job_title", { length: 100 }),
    linkedinUrl: text("linkedin_url"),
    twitterUrl: text("twitter_url"),
    githubUrl: text("github_url"),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "user_profiles_user_id_users_id_fk",
    }),
    unique("user_profiles_user_id_unique").on(table.userId),
  ],
);

export const securityEvents = pgTable(
  "security_events",
  {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id").notNull(),
    eventType: varchar("event_type", { length: 50 }).notNull(),
    eventDetails: json("event_details").default({}),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    location: varchar({ length: 255 }),
    riskLevel: varchar("risk_level", { length: 20 }).default("low").notNull(),
    timestamp: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "security_events_user_id_users_id_fk",
    }),
  ],
);

export const userLoginSessions = pgTable(
  "user_login_sessions",
  {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id").notNull(),
    sessionToken: text("session_token").notNull(),
    deviceInfo: json("device_info").default({}),
    ipAddress: varchar("ip_address", { length: 45 }),
    location: varchar({ length: 255 }),
    isActive: boolean("is_active").default(true).notNull(),
    lastActivity: timestamp("last_activity", { mode: "string" })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "user_login_sessions_user_id_users_id_fk",
    }),
    unique("user_login_sessions_session_token_unique").on(table.sessionToken),
  ],
);

export const userSecuritySettings = pgTable(
  "user_security_settings",
  {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id").notNull(),
    twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
    twoFactorSecret: text("two_factor_secret"),
    recoveryCodesHash: text("recovery_codes_hash"),
    lastPasswordChange: timestamp("last_password_change", {
      mode: "string",
    }).defaultNow(),
    passwordHistory: json("password_history").default([]),
    loginNotifications: boolean("login_notifications").default(true).notNull(),
    securityAlerts: boolean("security_alerts").default(true).notNull(),
    sessionTimeout: integer("session_timeout").default(24).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "user_security_settings_user_id_users_id_fk",
    }),
    unique("user_security_settings_user_id_unique").on(table.userId),
  ],
);
