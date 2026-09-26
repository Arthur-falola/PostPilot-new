import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// 1. Users Table (tied to Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  role: text('role').default('user'), // 'user' or 'admin'
  plan: text('plan').default('starter'), // 'starter', 'pro', 'agency'
  monthlyPostsCount: integer('monthly_posts_count').default(0),
  monthlyAnalysesCount: integer('monthly_analyses_count').default(0),
  fbConnected: boolean('fb_connected').default(false),
  fbAccessToken: text('fb_access_token'),
  skyboostConnected: boolean('skyboost_connected').default(false),
  skyboostApiKey: text('skyboost_api_key'),
  skyboostAccountEmail: text('skyboost_account_email'),
  skyboostBalance: text('skyboost_balance').default('15.00 €'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Facebook Pages Table
export const facebookPages = pgTable('facebook_pages', {
  id: text('id').primaryKey(), // Facebook Page ID
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  category: text('category').default('Product/service'),
  avatar: text('avatar'),
  followers: integer('followers').default(0),
  engagement: text('engagement').default('0%'),
  isActive: boolean('is_active').default(false),
  websiteUrl: text('website_url'),
  businessDescription: text('business_description'),
  targetAudience: text('target_audience'),
  offer: text('offer'),
  autoPilotEnabled: boolean('auto_pilot_enabled').default(false),
  autoPilotFrequency: text('auto_pilot_frequency').default('daily'),
  autoPilotHumor: text('auto_pilot_humor').default('viral_spicy'),
  brandAnalysis: text('brand_analysis'), // JSON stringified
  lastAutoRun: text('last_auto_run'),
  accessToken: text('access_token'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Posts Table
export const posts = pgTable('posts', {
  id: text('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  pageId: text('page_id')
    .references(() => facebookPages.id, { onDelete: 'cascade' })
    .notNull(),
  pageName: text('page_name').notNull(),
  pageAvatar: text('page_avatar'),
  content: text('content').notNull(),
  hashtags: text('hashtags'),
  cta: text('cta'),
  websiteUrl: text('website_url'),
  category: text('category'),
  mediaType: text('media_type').default('meme'),
  mediaUrl: text('media_url'),
  memeTopText: text('meme_top_text'),
  memeBottomText: text('meme_bottom_text'),
  status: text('status').default('scheduled'), // 'scheduled', 'published', 'draft'
  scheduledFor: text('scheduled_for'),
  clicks: integer('clicks').default(0),
  likes: integer('likes').default(0),
  shares: integer('shares').default(0),
  isAutonomous: boolean('is_autonomous').default(false),
  skyboostBoostRequested: boolean('skyboost_boost_requested').default(false),
  skyboostTargetLikes: integer('skyboost_target_likes').default(0),
  skyboostOrderStatus: text('skyboost_order_status'), // 'none', 'pending', 'processing', 'completed'
  skyboostOrderId: text('skyboost_order_id'),
  facebookPostId: text('facebook_post_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Notifications Table (autonomous recaps & alerts)
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  type: text('type').notNull(), // 'autonomous_action', 'traffic_alert', 'daily_ideas', 'system'
  title: text('title').notNull(),
  message: text('message').notNull(),
  timestamp: text('timestamp'),
  read: boolean('read').default(false),
  recapData: text('recap_data'), // JSON stringified
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. Meme Templates Table (Admin manageable & AI contextualizer)
export const memeTemplates = pgTable('meme_templates', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  imageUrl: text('image_url').notNull(),
  videoUrl: text('video_url'),
  description: text('description').notNull(), // "ce qu'on voit pour aider l'IA à générer le meilleur texte adapté"
  category: text('category').default('business'), // 'classique' | 'business' | 'video_court' | 'reaction'
  tags: text('tags').default(''),
  defaultTop: text('default_top'),
  defaultBottom: text('default_bottom'),
  type: text('type').default('image'), // 'image' | 'video'
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  pages: many(facebookPages),
  posts: many(posts),
  notifications: many(notifications),
}));

export const facebookPagesRelations = relations(facebookPages, ({ one, many }) => ({
  user: one(users, {
    fields: [facebookPages.userId],
    references: [users.id],
  }),
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  page: one(facebookPages, {
    fields: [posts.pageId],
    references: [facebookPages.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
