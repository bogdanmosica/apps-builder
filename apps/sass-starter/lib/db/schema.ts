import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  integer,
  json,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("member"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id)
    .unique(),
  firstName: varchar("first_name", { length: 50 }),
  lastName: varchar("last_name", { length: 50 }),
  bio: text("bio"),
  avatar: text("avatar"),
  phone: varchar("phone", { length: 20 }),
  timezone: varchar("timezone", { length: 50 }).default("UTC"),
  language: varchar("language", { length: 10 }).default("en"),
  companyName: varchar("company_name", { length: 100 }),
  companyWebsite: text("company_website"),
  jobTitle: varchar("job_title", { length: 100 }),
  linkedinUrl: text("linkedin_url"),
  twitterUrl: text("twitter_url"),
  githubUrl: text("github_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userSecuritySettings = pgTable("user_security_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id)
    .unique(),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  twoFactorSecret: text("two_factor_secret"), // Encrypted TOTP secret
  recoveryCodesHash: text("recovery_codes_hash"), // Hashed recovery codes
  lastPasswordChange: timestamp("last_password_change").defaultNow(),
  passwordHistory: json("password_history").default([]), // Stores hashed previous passwords
  loginNotifications: boolean("login_notifications").notNull().default(true),
  securityAlerts: boolean("security_alerts").notNull().default(true),
  sessionTimeout: integer("session_timeout").notNull().default(24), // Hours
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userLoginSessions = pgTable("user_login_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  sessionToken: text("session_token").notNull().unique(),
  deviceInfo: json("device_info").default({}), // Browser, OS, etc.
  ipAddress: varchar("ip_address", { length: 45 }),
  location: varchar("location", { length: 255 }), // City, Country
  isActive: boolean("is_active").notNull().default(true),
  lastActivity: timestamp("last_activity").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const securityEvents = pgTable("security_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  eventType: varchar("event_type", { length: 50 }).notNull(), // 'login', 'failed_login', 'password_change', 'session_revoked', etc.
  eventDetails: json("event_details").default({}),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  location: varchar("location", { length: 255 }),
  riskLevel: varchar("risk_level", { length: 20 }).notNull().default("low"), // 'low', 'medium', 'high'
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripeProductId: text("stripe_product_id"),
  planName: varchar("plan_name", { length: 50 }),
  subscriptionStatus: varchar("subscription_status", { length: 20 }),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  role: varchar("role", { length: 50 }).notNull(),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  ipAddress: varchar("ip_address", { length: 45 }),
});

export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  email: varchar("email", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  invitedBy: integer("invited_by")
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp("invited_at").notNull().defaultNow(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  planName: varchar("plan_name", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  amount: integer("amount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).notNull().default("usd"),
  billingPeriod: varchar("billing_period", { length: 20 })
    .notNull()
    .default("monthly"),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  subscriptionId: integer("subscription_id").references(() => subscriptions.id),
  amount: integer("amount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).notNull().default("usd"),
  status: varchar("status", { length: 20 }).notNull().default("completed"),
  stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in minutes
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  price: integer("price").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).notNull().default("usd"),
  billingPeriod: varchar("billing_period", { length: 20 })
    .notNull()
    .default("monthly"), // monthly, yearly, one_time
  isActive: varchar("is_active", { length: 10 }).notNull().default("true"),
  stripeProductId: text("stripe_product_id").unique(),
  stripePriceId: text("stripe_price_id").unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const pricingPlans = pgTable("pricing_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  price: integer("price").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).notNull().default("usd"),
  billingPeriod: varchar("billing_period", { length: 20 })
    .notNull()
    .default("monthly"), // monthly, yearly
  features: text("features").notNull(), // JSON string of features array
  isPopular: varchar("is_popular", { length: 10 }).notNull().default("false"),
  isActive: varchar("is_active", { length: 10 }).notNull().default("true"),
  stripePriceId: text("stripe_price_id").unique(),
  stripeProductId: text("stripe_product_id").unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
  subscriptions: many(subscriptions),
  payments: many(payments),
  userSessions: many(userSessions),
  products: many(products),
  integrations: many(integrations),
  apiRequests: many(apiRequests),
  webhooks: many(webhooks),
  webhookDeliveries: many(webhookDeliveries),
  apiKeys: many(apiKeys),
  conversations: many(conversations),
  messages: many(messages),
  campaigns: many(campaigns),
  communicationTemplates: many(communicationTemplates),
  notifications: many(notifications),
  communicationStats: many(communicationStats),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  securitySettings: one(userSecuritySettings, {
    fields: [users.id],
    references: [userSecuritySettings.userId],
  }),
  loginSessions: many(userLoginSessions),
  securityEvents: many(securityEvents),
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
  subscriptions: many(subscriptions),
  payments: many(payments),
  userSessions: many(userSessions),
  assignedConversations: many(conversations),
  sentMessages: many(messages),
  createdCampaigns: many(campaigns),
  createdTemplates: many(communicationTemplates),
  notifications: many(notifications),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const userSecuritySettingsRelations = relations(
  userSecuritySettings,
  ({ one }) => ({
    user: one(users, {
      fields: [userSecuritySettings.userId],
      references: [users.id],
    }),
  }),
);

export const userLoginSessionsRelations = relations(
  userLoginSessions,
  ({ one }) => ({
    user: one(users, {
      fields: [userLoginSessions.userId],
      references: [users.id],
    }),
  }),
);

export const securityEventsRelations = relations(securityEvents, ({ one }) => ({
  user: one(users, {
    fields: [securityEvents.userId],
    references: [users.id],
  }),
}));

export const subscriptionsRelations = relations(
  subscriptions,
  ({ one, many }) => ({
    team: one(teams, {
      fields: [subscriptions.teamId],
      references: [teams.id],
    }),
    user: one(users, {
      fields: [subscriptions.userId],
      references: [users.id],
    }),
    payments: many(payments),
  }),
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  team: one(teams, {
    fields: [payments.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  subscription: one(subscriptions, {
    fields: [payments.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [userSessions.teamId],
    references: [teams.id],
  }),
}));

export const productsRelations = relations(products, ({ one }) => ({
  team: one(teams, {
    fields: [products.teamId],
    references: [teams.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
export type UserSecuritySettings = typeof userSecuritySettings.$inferSelect;
export type NewUserSecuritySettings = typeof userSecuritySettings.$inferInsert;
export type UserLoginSession = typeof userLoginSessions.$inferSelect;
export type NewUserLoginSession = typeof userLoginSessions.$inferInsert;
export type SecurityEvent = typeof securityEvents.$inferSelect;
export type NewSecurityEvent = typeof securityEvents.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, "id" | "name" | "email">;
  })[];
};

export enum ActivityType {
  SIGN_UP = "SIGN_UP",
  SIGN_IN = "SIGN_IN",
  SIGN_OUT = "SIGN_OUT",
  UPDATE_PASSWORD = "UPDATE_PASSWORD",
  DELETE_ACCOUNT = "DELETE_ACCOUNT",
  UPDATE_ACCOUNT = "UPDATE_ACCOUNT",
  CREATE_TEAM = "CREATE_TEAM",
  REMOVE_TEAM_MEMBER = "REMOVE_TEAM_MEMBER",
  INVITE_TEAM_MEMBER = "INVITE_TEAM_MEMBER",
  ACCEPT_INVITATION = "ACCEPT_INVITATION",
}

// Integration Management Tables
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // 'communication', 'development', 'payments', 'email', etc.
  status: varchar("status", { length: 20 }).notNull().default("disconnected"), // 'connected', 'disconnected', 'error'
  health: varchar("health", { length: 20 }).notNull().default("unknown"), // 'healthy', 'warning', 'error'
  dataFlow: varchar("data_flow", { length: 20 })
    .notNull()
    .default("bidirectional"), // 'inbound', 'outbound', 'bidirectional'
  config: json("config").default({}), // Integration-specific configuration
  credentials: json("credentials").default({}), // Encrypted credentials
  lastSync: timestamp("last_sync"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const apiRequests = pgTable("api_requests", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  integrationId: integer("integration_id").references(() => integrations.id),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(), // GET, POST, PUT, DELETE, etc.
  statusCode: integer("status_code").notNull(),
  responseTime: integer("response_time").notNull(), // in milliseconds
  requestSize: integer("request_size"), // in bytes
  responseSize: integer("response_size"), // in bytes
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  isSuccess: boolean("is_success").notNull().default(true),
  errorMessage: text("error_message"),
});

export const webhooks = pgTable("webhooks", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  integrationId: integer("integration_id").references(() => integrations.id),
  name: varchar("name", { length: 100 }).notNull(),
  url: text("url").notNull(),
  events: json("events").notNull(), // Array of event names
  status: varchar("status", { length: 20 }).notNull().default("active"), // 'active', 'paused', 'error'
  secret: text("secret"), // Webhook secret for validation
  retries: integer("retries").notNull().default(3),
  timeout: integer("timeout").notNull().default(30), // in seconds
  lastTriggered: timestamp("last_triggered"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const webhookDeliveries = pgTable("webhook_deliveries", {
  id: serial("id").primaryKey(),
  webhookId: integer("webhook_id")
    .notNull()
    .references(() => webhooks.id),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  event: varchar("event", { length: 100 }).notNull(),
  payload: json("payload").notNull(),
  statusCode: integer("status_code"),
  responseTime: integer("response_time"), // in milliseconds
  attempts: integer("attempts").notNull().default(1),
  isSuccess: boolean("is_success").notNull().default(false),
  errorMessage: text("error_message"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  keyHash: text("key_hash").notNull(), // Hashed API key
  permissions: json("permissions").notNull(), // Array of permissions
  environment: varchar("environment", { length: 20 })
    .notNull()
    .default("production"), // 'production', 'development'
  status: varchar("status", { length: 20 }).notNull().default("active"), // 'active', 'inactive', 'revoked'
  rateLimit: integer("rate_limit").notNull().default(1000), // requests per hour
  lastUsed: timestamp("last_used"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations for integration tables
export const integrationsRelations = relations(
  integrations,
  ({ one, many }) => ({
    team: one(teams, {
      fields: [integrations.teamId],
      references: [teams.id],
    }),
    apiRequests: many(apiRequests),
    webhooks: many(webhooks),
  }),
);

export const apiRequestsRelations = relations(apiRequests, ({ one }) => ({
  team: one(teams, {
    fields: [apiRequests.teamId],
    references: [teams.id],
  }),
  integration: one(integrations, {
    fields: [apiRequests.integrationId],
    references: [integrations.id],
  }),
}));

export const webhooksRelations = relations(webhooks, ({ one, many }) => ({
  team: one(teams, {
    fields: [webhooks.teamId],
    references: [teams.id],
  }),
  integration: one(integrations, {
    fields: [webhooks.integrationId],
    references: [integrations.id],
  }),
  deliveries: many(webhookDeliveries),
}));

export const webhookDeliveriesRelations = relations(
  webhookDeliveries,
  ({ one }) => ({
    webhook: one(webhooks, {
      fields: [webhookDeliveries.webhookId],
      references: [webhooks.id],
    }),
    team: one(teams, {
      fields: [webhookDeliveries.teamId],
      references: [teams.id],
    }),
  }),
);

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  team: one(teams, {
    fields: [apiKeys.teamId],
    references: [teams.id],
  }),
}));

// Type exports for integration tables
export type Integration = typeof integrations.$inferSelect;
export type NewIntegration = typeof integrations.$inferInsert;
export type ApiRequest = typeof apiRequests.$inferSelect;
export type NewApiRequest = typeof apiRequests.$inferInsert;
export type Webhook = typeof webhooks.$inferSelect;
export type NewWebhook = typeof webhooks.$inferInsert;
export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;
export type NewWebhookDelivery = typeof webhookDeliveries.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;

// Communication Management Tables
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  participantName: varchar("participant_name", { length: 100 }).notNull(),
  participantEmail: varchar("participant_email", { length: 255 }).notNull(),
  participantAvatar: text("participant_avatar"),
  lastMessage: text("last_message"),
  lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
  unreadCount: integer("unread_count").notNull().default(0),
  status: varchar("status", { length: 20 }).notNull().default("active"), // 'active', 'archived', 'closed'
  participantStatus: varchar("participant_status", { length: 20 })
    .notNull()
    .default("offline"), // 'online', 'away', 'offline'
  type: varchar("type", { length: 20 }).notNull().default("support"), // 'support', 'sales', 'feedback'
  priority: varchar("priority", { length: 10 }).notNull().default("medium"), // 'low', 'medium', 'high'
  assignedTo: integer("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .notNull()
    .references(() => conversations.id),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  senderId: integer("sender_id").references(() => users.id), // null if from participant
  senderName: varchar("sender_name", { length: 100 }).notNull(),
  senderEmail: varchar("sender_email", { length: 255 }).notNull(),
  content: text("content").notNull(),
  messageType: varchar("message_type", { length: 20 })
    .notNull()
    .default("text"), // 'text', 'image', 'file', 'system'
  attachments: json("attachments").default([]), // Array of attachment objects
  isRead: boolean("is_read").notNull().default(false),
  isFromParticipant: boolean("is_from_participant").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 20 }).notNull().default("email"), // 'email', 'sms', 'push', 'survey'
  status: varchar("status", { length: 20 }).notNull().default("draft"), // 'draft', 'scheduled', 'sent', 'active', 'paused', 'completed'
  templateId: integer("template_id").references(
    () => communicationTemplates.id,
  ),
  recipientCount: integer("recipient_count").notNull().default(0),
  sentCount: integer("sent_count").notNull().default(0),
  openCount: integer("open_count").notNull().default(0),
  clickCount: integer("click_count").notNull().default(0),
  responseCount: integer("response_count").notNull().default(0),
  openRate: decimal("open_rate", { precision: 5, scale: 2 }).default("0.00"),
  clickRate: decimal("click_rate", { precision: 5, scale: 2 }).default("0.00"),
  responseRate: decimal("response_rate", { precision: 5, scale: 2 }).default(
    "0.00",
  ),
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const communicationTemplates = pgTable("communication_templates", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 20 }).notNull().default("email"), // 'email', 'message', 'notification', 'sms'
  category: varchar("category", { length: 50 }).notNull(), // 'onboarding', 'support', 'marketing', 'product'
  subject: varchar("subject", { length: 255 }),
  content: text("content").notNull(),
  variables: json("variables").default([]), // Array of template variables
  usageCount: integer("usage_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  userId: integer("user_id").references(() => users.id), // null for system notifications
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 20 }).notNull().default("info"), // 'info', 'success', 'warning', 'error', 'message', 'campaign', 'alert'
  priority: varchar("priority", { length: 10 }).notNull().default("medium"), // 'low', 'medium', 'high'
  isRead: boolean("is_read").notNull().default(false),
  actionUrl: text("action_url"),
  metadata: json("metadata").default({}), // Additional notification data
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const communicationStats = pgTable("communication_stats", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  date: timestamp("date").notNull().defaultNow(),
  totalConversations: integer("total_conversations").notNull().default(0),
  activeConversations: integer("active_conversations").notNull().default(0),
  newConversations: integer("new_conversations").notNull().default(0),
  closedConversations: integer("closed_conversations").notNull().default(0),
  unreadMessages: integer("unread_messages").notNull().default(0),
  totalMessages: integer("total_messages").notNull().default(0),
  activeUsers: integer("active_users").notNull().default(0),
  avgResponseTime: integer("avg_response_time").notNull().default(0), // in minutes
  satisfactionRate: decimal("satisfaction_rate", {
    precision: 5,
    scale: 2,
  }).default("0.00"),
  ticketsResolved: integer("tickets_resolved").notNull().default(0),
  campaignsSent: integer("campaigns_sent").notNull().default(0),
  emailsDelivered: integer("emails_delivered").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations for communication tables
export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    team: one(teams, {
      fields: [conversations.teamId],
      references: [teams.id],
    }),
    assignedUser: one(users, {
      fields: [conversations.assignedTo],
      references: [users.id],
    }),
    messages: many(messages),
  }),
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  team: one(teams, {
    fields: [messages.teamId],
    references: [teams.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const campaignsRelations = relations(campaigns, ({ one }) => ({
  team: one(teams, {
    fields: [campaigns.teamId],
    references: [teams.id],
  }),
  createdBy: one(users, {
    fields: [campaigns.createdBy],
    references: [users.id],
  }),
  template: one(communicationTemplates, {
    fields: [campaigns.templateId],
    references: [communicationTemplates.id],
  }),
}));

export const communicationTemplatesRelations = relations(
  communicationTemplates,
  ({ one, many }) => ({
    team: one(teams, {
      fields: [communicationTemplates.teamId],
      references: [teams.id],
    }),
    createdBy: one(users, {
      fields: [communicationTemplates.createdBy],
      references: [users.id],
    }),
    campaigns: many(campaigns),
  }),
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  team: one(teams, {
    fields: [notifications.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const communicationStatsRelations = relations(
  communicationStats,
  ({ one }) => ({
    team: one(teams, {
      fields: [communicationStats.teamId],
      references: [teams.id],
    }),
  }),
);

// Type exports for communication tables
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;
export type CommunicationTemplate = typeof communicationTemplates.$inferSelect;
export type NewCommunicationTemplate =
  typeof communicationTemplates.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type CommunicationStats = typeof communicationStats.$inferSelect;
export type NewCommunicationStats = typeof communicationStats.$inferInsert;

// Content Management Tables
export const contentCategories = pgTable("content_categories", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 20 }).default("bg-blue-500"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const contentPosts = pgTable("content_posts", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  content: text("content"),
  excerpt: text("excerpt"),
  status: varchar("status", { length: 20 }).notNull().default("draft"), // 'draft', 'published', 'archived'
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id),
  categoryId: integer("category_id").references(() => contentCategories.id),
  tags: json("tags").default([]), // Array of tag strings
  featuredImage: text("featured_image"),
  isFeatured: boolean("is_featured").notNull().default(false),
  views: integer("views").notNull().default(0),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const contentComments = pgTable("content_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => contentPosts.id),
  authorName: varchar("author_name", { length: 100 }).notNull(),
  authorEmail: varchar("author_email", { length: 255 }).notNull(),
  content: text("content").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // 'pending', 'approved', 'spam'
  parentId: integer("parent_id"), // For nested comments - self reference will be added later
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const contentMedia = pgTable("content_media", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  name: varchar("name", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: integer("size").notNull(), // in bytes
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  dimensions: varchar("dimensions", { length: 20 }), // e.g., "1920x1080"
  duration: integer("duration"), // for videos, in seconds
  uploadedBy: integer("uploaded_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations for content management tables
export const contentCategoriesRelations = relations(
  contentCategories,
  ({ one, many }) => ({
    team: one(teams, {
      fields: [contentCategories.teamId],
      references: [teams.id],
    }),
    posts: many(contentPosts),
  }),
);

export const contentPostsRelations = relations(
  contentPosts,
  ({ one, many }) => ({
    team: one(teams, {
      fields: [contentPosts.teamId],
      references: [teams.id],
    }),
    author: one(users, {
      fields: [contentPosts.authorId],
      references: [users.id],
    }),
    category: one(contentCategories, {
      fields: [contentPosts.categoryId],
      references: [contentCategories.id],
    }),
    comments: many(contentComments),
  }),
);

export const contentCommentsRelations = relations(
  contentComments,
  ({ one, many }) => ({
    post: one(contentPosts, {
      fields: [contentComments.postId],
      references: [contentPosts.id],
    }),
    parent: one(contentComments, {
      fields: [contentComments.parentId],
      references: [contentComments.id],
    }),
    replies: many(contentComments),
  }),
);

export const contentMediaRelations = relations(contentMedia, ({ one }) => ({
  team: one(teams, {
    fields: [contentMedia.teamId],
    references: [teams.id],
  }),
  uploadedBy: one(users, {
    fields: [contentMedia.uploadedBy],
    references: [users.id],
  }),
}));

// Update teams relations to include content tables
export const teamsRelationsUpdated = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
  subscriptions: many(subscriptions),
  payments: many(payments),
  userSessions: many(userSessions),
  products: many(products),
  integrations: many(integrations),
  apiRequests: many(apiRequests),
  webhooks: many(webhooks),
  webhookDeliveries: many(webhookDeliveries),
  apiKeys: many(apiKeys),
  conversations: many(conversations),
  messages: many(messages),
  campaigns: many(campaigns),
  communicationTemplates: many(communicationTemplates),
  notifications: many(notifications),
  communicationStats: many(communicationStats),
  contentCategories: many(contentCategories),
  contentPosts: many(contentPosts),
  contentMedia: many(contentMedia),
}));

// Type exports for content management tables
export type ContentCategory = typeof contentCategories.$inferSelect;
export type NewContentCategory = typeof contentCategories.$inferInsert;
export type ContentPost = typeof contentPosts.$inferSelect;
export type NewContentPost = typeof contentPosts.$inferInsert;
export type ContentComment = typeof contentComments.$inferSelect;
export type NewContentComment = typeof contentComments.$inferInsert;
export type ContentMedia = typeof contentMedia.$inferSelect;
export type NewContentMedia = typeof contentMedia.$inferInsert;
