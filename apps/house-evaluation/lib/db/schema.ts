import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash'),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  // Profile fields
  avatar: text('avatar'),
  phone: varchar('phone', { length: 20 }),
  // User type fields
  userType: varchar('user_type', { length: 20 }).notNull().default('tenant'), // tenant, buyer, investor
  companyName: varchar('company_name', { length: 200 }),
  investmentBudget: integer('investment_budget'),
  // OAuth fields
  provider: varchar('provider', { length: 50 }),
  providerId: text('provider_id'),
  emailVerified: timestamp('email_verified'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  refreshToken: text('refresh_token'),
  accessToken: text('access_token'),
  expiresAt: integer('expires_at'),
  tokenType: varchar('token_type', { length: 255 }),
  scope: varchar('scope', { length: 255 }),
  idToken: text('id_token'),
  sessionState: varchar('session_state', { length: 255 }),
});

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
});

export const verificationTokens = pgTable('verification_tokens', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expires: timestamp('expires').notNull(),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

export const properties = pgTable('properties', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  propertyType: varchar('property_type', { length: 50 }).notNull(), // apartment, house, villa, commercial, land
  listingType: varchar('listing_type', { length: 20 }).notNull(), // sale, rent
  
  // Location
  address: text('address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  county: varchar('county', { length: 100 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }),
  latitude: varchar('latitude', { length: 20 }),
  longitude: varchar('longitude', { length: 20 }),
  
  // Property details
  price: integer('price').notNull(), // Price in EUR cents
  currency: varchar('currency', { length: 3 }).notNull().default('EUR'),
  area: integer('area'), // Square meters
  rooms: integer('rooms'),
  bedrooms: integer('bedrooms'),
  bathrooms: integer('bathrooms'),
  floor: integer('floor'),
  totalFloors: integer('total_floors'),
  yearBuilt: integer('year_built'),
  
  // Features and amenities
  features: text('features'), // JSON array of features
  amenities: text('amenities'), // JSON array of amenities
  
  // Media
  mainImage: text('main_image'),
  images: text('images'), // JSON array of image URLs
  virtualTourUrl: text('virtual_tour_url'),
  
  // Status and metadata
  status: varchar('status', { length: 20 }).notNull().default('active'), // active, sold, rented, inactive
  views: integer('views').notNull().default(0),
  featured: integer('featured').notNull().default(0), // 0 = false, 1 = true
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const propertyImages = pgTable('property_images', {
  id: serial('id').primaryKey(),
  propertyId: integer('property_id')
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  caption: varchar('caption', { length: 255 }),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const propertyInquiries = pgTable('property_inquiries', {
  id: serial('id').primaryKey(),
  propertyId: integer('property_id')
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  message: text('message').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('new'), // new, replied, closed
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const propertyFavorites = pgTable('property_favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  propertyId: integer('property_id')
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Evaluation system tables
export const evaluationQuestions = pgTable('evaluation_questions', {
  id: serial('id').primaryKey(),
  question: text('question').notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull(), // location, condition, efficiency, etc.
  weight: integer('weight').notNull().default(100), // Weight out of 100 for this question
  isActive: integer('is_active').notNull().default(1), // 0 = false, 1 = true
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const evaluationAnswerChoices = pgTable('evaluation_answer_choices', {
  id: serial('id').primaryKey(),
  questionId: integer('question_id')
    .notNull()
    .references(() => evaluationQuestions.id, { onDelete: 'cascade' }),
  answerText: text('answer_text').notNull(),
  answerValue: integer('answer_value').notNull(), // Score value for this answer (0-100)
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const propertyEvaluations = pgTable('property_evaluations', {
  id: serial('id').primaryKey(),
  propertyId: integer('property_id')
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  questionId: integer('question_id')
    .notNull()
    .references(() => evaluationQuestions.id, { onDelete: 'cascade' }),
  answerChoiceId: integer('answer_choice_id')
    .references(() => evaluationAnswerChoices.id, { onDelete: 'set null' }),
  customAnswer: text('custom_answer'), // For open-ended questions
  evaluatedBy: integer('evaluated_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const propertyQualityScores = pgTable('property_quality_scores', {
  id: serial('id').primaryKey(),
  propertyId: integer('property_id')
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' })
    .unique(),
  totalScore: integer('total_score').notNull().default(0), // Weighted total score (0-100)
  starRating: integer('star_rating').notNull().default(1), // 1-5 stars based on total score
  lastCalculatedAt: timestamp('last_calculated_at').notNull().defaultNow(),
  calculatedBy: integer('calculated_by')
    .references(() => users.id),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many, one }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
  accounts: many(accounts),
  sessions: many(sessions),
  properties: many(properties),
  propertyInquiries: many(propertyInquiries),
  propertyFavorites: many(propertyFavorites),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
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

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  user: one(users, {
    fields: [properties.userId],
    references: [users.id],
  }),
  propertyImages: many(propertyImages),
  propertyInquiries: many(propertyInquiries),
  propertyFavorites: many(propertyFavorites),
  propertyEvaluations: many(propertyEvaluations),
  qualityScore: one(propertyQualityScores, {
    fields: [properties.id],
    references: [propertyQualityScores.propertyId],
  }),
}));

export const propertyImagesRelations = relations(propertyImages, ({ one }) => ({
  property: one(properties, {
    fields: [propertyImages.propertyId],
    references: [properties.id],
  }),
}));

export const propertyInquiriesRelations = relations(propertyInquiries, ({ one }) => ({
  property: one(properties, {
    fields: [propertyInquiries.propertyId],
    references: [properties.id],
  }),
  user: one(users, {
    fields: [propertyInquiries.userId],
    references: [users.id],
  }),
}));

export const propertyFavoritesRelations = relations(propertyFavorites, ({ one }) => ({
  user: one(users, {
    fields: [propertyFavorites.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [propertyFavorites.propertyId],
    references: [properties.id],
  }),
}));

export const evaluationQuestionsRelations = relations(evaluationQuestions, ({ many }) => ({
  answerChoices: many(evaluationAnswerChoices),
  propertyEvaluations: many(propertyEvaluations),
}));

export const evaluationAnswerChoicesRelations = relations(evaluationAnswerChoices, ({ one, many }) => ({
  question: one(evaluationQuestions, {
    fields: [evaluationAnswerChoices.questionId],
    references: [evaluationQuestions.id],
  }),
  propertyEvaluations: many(propertyEvaluations),
}));

export const propertyEvaluationsRelations = relations(propertyEvaluations, ({ one }) => ({
  property: one(properties, {
    fields: [propertyEvaluations.propertyId],
    references: [properties.id],
  }),
  question: one(evaluationQuestions, {
    fields: [propertyEvaluations.questionId],
    references: [evaluationQuestions.id],
  }),
  answerChoice: one(evaluationAnswerChoices, {
    fields: [propertyEvaluations.answerChoiceId],
    references: [evaluationAnswerChoices.id],
  }),
  evaluatedByUser: one(users, {
    fields: [propertyEvaluations.evaluatedBy],
    references: [users.id],
  }),
}));

export const propertyQualityScoresRelations = relations(propertyQualityScores, ({ one }) => ({
  property: one(properties, {
    fields: [propertyQualityScores.propertyId],
    references: [properties.id],
  }),
  calculatedByUser: one(users, {
    fields: [propertyQualityScores.calculatedBy],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
export type PropertyImage = typeof propertyImages.$inferSelect;
export type NewPropertyImage = typeof propertyImages.$inferInsert;
export type PropertyInquiry = typeof propertyInquiries.$inferSelect;
export type NewPropertyInquiry = typeof propertyInquiries.$inferInsert;
export type PropertyFavorite = typeof propertyFavorites.$inferSelect;
export type NewPropertyFavorite = typeof propertyFavorites.$inferInsert;

export type EvaluationQuestion = typeof evaluationQuestions.$inferSelect;
export type NewEvaluationQuestion = typeof evaluationQuestions.$inferInsert;
export type EvaluationAnswerChoice = typeof evaluationAnswerChoices.$inferSelect;
export type NewEvaluationAnswerChoice = typeof evaluationAnswerChoices.$inferInsert;
export type PropertyEvaluation = typeof propertyEvaluations.$inferSelect;
export type NewPropertyEvaluation = typeof propertyEvaluations.$inferInsert;
export type PropertyQualityScore = typeof propertyQualityScores.$inferSelect;
export type NewPropertyQualityScore = typeof propertyQualityScores.$inferInsert;

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}

export enum UserType {
  TENANT = 'tenant',
  BUYER = 'buyer',
  INVESTOR = 'investor',
}
