import { pgTable, serial, varchar, text, boolean, timestamp, pgEnum, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const planEnum = pgEnum('plan', ['normal', 'pro', 'enterprise']);
export const statusEnum = pgEnum('status', ['pending', 'approved', 'denied']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  companyName: varchar('company_name', { length: 255 }),
  password: varchar('password', { length: 255 }).notNull(),
  plan: planEnum('plan').notNull().default('normal'),
  role: userRoleEnum('role').notNull().default('user'),
  status: statusEnum('status').notNull().default('pending'),
  monitoringData: jsonb('monitoring_data'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const keywords = pgTable('keywords', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  keyword: varchar('keyword', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const newsArticles = pgTable('news_articles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  keyword: varchar('keyword', { length: 255 }).notNull(),
  articleId: varchar('article_id', { length: 50 }).notNull(), // APITube article ID (can be very large)
  title: text('title').notNull(),
  description: text('description'),
  url: text('url').notNull(),
  publishedAt: timestamp('published_at').notNull(),
  sourceName: varchar('source_name', { length: 255 }).notNull(),
  sourceLogo: text('source_logo'),
  image: text('image'),
  sentimentScore: integer('sentiment_score'), // -100 to 100
  sentimentLabel: varchar('sentiment_label', { length: 50 }),
  readTime: integer('read_time'),
  isBreaking: boolean('is_breaking').default(false),
  categories: jsonb('categories'),
  topics: jsonb('topics'),
  engagement: jsonb('engagement'),
  rawData: jsonb('raw_data'), // Store complete APITube response
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const socialPosts = pgTable('social_posts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  keyword: varchar('keyword', { length: 255 }).notNull(),
  postId: varchar('post_id', { length: 255 }).notNull(),
  title: text('title'),
  description: text('description'),
  url: text('url'),
  publishedAt: timestamp('published_at').notNull(),
  platformName: varchar('platform_name', { length: 255 }).notNull(),
  platformLogo: text('platform_logo'),
  image: text('image'),
  sentimentScore: integer('sentiment_score'),
  sentimentLabel: varchar('sentiment_label', { length: 50 }),
  engagement: jsonb('engagement'),
  rawData: jsonb('raw_data'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  keywords: many(keywords),
  newsArticles: many(newsArticles),
  socialPosts: many(socialPosts),
}));

export const keywordsRelations = relations(keywords, ({ one }) => ({
  user: one(users, {
    fields: [keywords.userId],
    references: [users.id],
  }),
}));

export const newsArticlesRelations = relations(newsArticles, ({ one }) => ({
  user: one(users, {
    fields: [newsArticles.userId],
    references: [users.id],
  }),
}));

export const socialPostsRelations = relations(socialPosts, ({ one }) => ({
  user: one(users, {
    fields: [socialPosts.userId],
    references: [users.id],
  }),
}));
