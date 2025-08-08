import { relations } from "drizzle-orm/relations";
import {
  activityLogs,
  apiKeys,
  apiRequests,
  campaigns,
  communicationStats,
  communicationTemplates,
  contentCategories,
  contentComments,
  contentMedia,
  contentPosts,
  conversations,
  integrations,
  invitations,
  messages,
  notifications,
  payments,
  products,
  securityEvents,
  subscriptions,
  teamMembers,
  teams,
  userLoginSessions,
  userProfiles,
  userSecuritySettings,
  userSessions,
  users,
  webhookDeliveries,
  webhooks,
} from "./schema";

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

export const teamsRelations = relations(teams, ({ many }) => ({
  subscriptions: many(subscriptions),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
  teamMembers: many(teamMembers),
  payments: many(payments),
  userSessions: many(userSessions),
  products: many(products),
  webhooks: many(webhooks),
  communicationStats: many(communicationStats),
  apiKeys: many(apiKeys),
  apiRequests: many(apiRequests),
  integrations: many(integrations),
  webhookDeliveries: many(webhookDeliveries),
  campaigns: many(campaigns),
  communicationTemplates: many(communicationTemplates),
  conversations: many(conversations),
  messages: many(messages),
  notifications: many(notifications),
  contentCategories: many(contentCategories),
  contentPosts: many(contentPosts),
  contentMedias: many(contentMedia),
}));

export const usersRelations = relations(users, ({ many }) => ({
  subscriptions: many(subscriptions),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
  teamMembers: many(teamMembers),
  payments: many(payments),
  userSessions: many(userSessions),
  campaigns: many(campaigns),
  communicationTemplates: many(communicationTemplates),
  conversations: many(conversations),
  messages: many(messages),
  notifications: many(notifications),
  contentPosts: many(contentPosts),
  contentMedias: many(contentMedia),
  userProfiles: many(userProfiles),
  securityEvents: many(securityEvents),
  userLoginSessions: many(userLoginSessions),
  userSecuritySettings: many(userSecuritySettings),
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

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  user: one(users, {
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

export const webhooksRelations = relations(webhooks, ({ one, many }) => ({
  team: one(teams, {
    fields: [webhooks.teamId],
    references: [teams.id],
  }),
  integration: one(integrations, {
    fields: [webhooks.integrationId],
    references: [integrations.id],
  }),
  webhookDeliveries: many(webhookDeliveries),
}));

export const integrationsRelations = relations(
  integrations,
  ({ one, many }) => ({
    webhooks: many(webhooks),
    apiRequests: many(apiRequests),
    team: one(teams, {
      fields: [integrations.teamId],
      references: [teams.id],
    }),
  }),
);

export const communicationStatsRelations = relations(
  communicationStats,
  ({ one }) => ({
    team: one(teams, {
      fields: [communicationStats.teamId],
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

export const campaignsRelations = relations(campaigns, ({ one }) => ({
  team: one(teams, {
    fields: [campaigns.teamId],
    references: [teams.id],
  }),
  communicationTemplate: one(communicationTemplates, {
    fields: [campaigns.templateId],
    references: [communicationTemplates.id],
  }),
  user: one(users, {
    fields: [campaigns.createdBy],
    references: [users.id],
  }),
}));

export const communicationTemplatesRelations = relations(
  communicationTemplates,
  ({ one, many }) => ({
    campaigns: many(campaigns),
    team: one(teams, {
      fields: [communicationTemplates.teamId],
      references: [teams.id],
    }),
    user: one(users, {
      fields: [communicationTemplates.createdBy],
      references: [users.id],
    }),
  }),
);

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    team: one(teams, {
      fields: [conversations.teamId],
      references: [teams.id],
    }),
    user: one(users, {
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
  user: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

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

export const contentCommentsRelations = relations(
  contentComments,
  ({ one }) => ({
    contentPost: one(contentPosts, {
      fields: [contentComments.postId],
      references: [contentPosts.id],
    }),
  }),
);

export const contentPostsRelations = relations(
  contentPosts,
  ({ one, many }) => ({
    contentComments: many(contentComments),
    team: one(teams, {
      fields: [contentPosts.teamId],
      references: [teams.id],
    }),
    user: one(users, {
      fields: [contentPosts.authorId],
      references: [users.id],
    }),
    contentCategory: one(contentCategories, {
      fields: [contentPosts.categoryId],
      references: [contentCategories.id],
    }),
  }),
);

export const contentCategoriesRelations = relations(
  contentCategories,
  ({ one, many }) => ({
    team: one(teams, {
      fields: [contentCategories.teamId],
      references: [teams.id],
    }),
    contentPosts: many(contentPosts),
  }),
);

export const contentMediaRelations = relations(contentMedia, ({ one }) => ({
  team: one(teams, {
    fields: [contentMedia.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [contentMedia.uploadedBy],
    references: [users.id],
  }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const securityEventsRelations = relations(securityEvents, ({ one }) => ({
  user: one(users, {
    fields: [securityEvents.userId],
    references: [users.id],
  }),
}));

export const userLoginSessionsRelations = relations(
  userLoginSessions,
  ({ one }) => ({
    user: one(users, {
      fields: [userLoginSessions.userId],
      references: [users.id],
    }),
  }),
);

export const userSecuritySettingsRelations = relations(
  userSecuritySettings,
  ({ one }) => ({
    user: one(users, {
      fields: [userSecuritySettings.userId],
      references: [users.id],
    }),
  }),
);
