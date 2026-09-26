import { db, createPool } from './index.ts';
import { facebookPages, posts, notifications, users, memeTemplates } from './schema.ts';
import { eq, and, desc, sql } from 'drizzle-orm';

// --- Database Auto-initialization (Idempotent DDL) ---
export async function initDbSchema() {
  try {
    const pool = createPool();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        uid TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        display_name TEXT,
        photo_url TEXT,
        role TEXT DEFAULT 'user',
        plan TEXT DEFAULT 'starter',
        monthly_posts_count INTEGER DEFAULT 0,
        monthly_analyses_count INTEGER DEFAULT 0,
        fb_connected BOOLEAN DEFAULT false,
        fb_access_token TEXT,
        skyboost_connected BOOLEAN DEFAULT false,
        skyboost_api_key TEXT,
        skyboost_account_email TEXT,
        skyboost_balance TEXT DEFAULT '15.00 €',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS facebook_pages (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        category TEXT DEFAULT 'Product/service',
        avatar TEXT,
        followers INTEGER DEFAULT 0,
        engagement TEXT DEFAULT '0%',
        is_active BOOLEAN DEFAULT false,
        website_url TEXT,
        business_description TEXT,
        target_audience TEXT,
        offer TEXT,
        auto_pilot_enabled BOOLEAN DEFAULT false,
        auto_pilot_frequency TEXT DEFAULT 'daily',
        auto_pilot_humor TEXT DEFAULT 'viral_spicy',
        brand_analysis TEXT,
        last_auto_run TEXT,
        access_token TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        page_id TEXT NOT NULL REFERENCES facebook_pages(id) ON DELETE CASCADE,
        page_name TEXT NOT NULL,
        page_avatar TEXT,
        content TEXT NOT NULL,
        hashtags TEXT,
        cta TEXT,
        website_url TEXT,
        category TEXT,
        media_type TEXT DEFAULT 'meme',
        media_url TEXT,
        meme_top_text TEXT,
        meme_bottom_text TEXT,
        status TEXT DEFAULT 'scheduled',
        scheduled_for TEXT,
        clicks INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        is_autonomous BOOLEAN DEFAULT false,
        skyboost_boost_requested BOOLEAN DEFAULT false,
        skyboost_target_likes INTEGER DEFAULT 0,
        skyboost_order_status TEXT,
        skyboost_order_id TEXT,
        facebook_post_id TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp TEXT,
        read BOOLEAN DEFAULT false,
        recap_data TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS meme_templates (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        image_url TEXT NOT NULL,
        video_url TEXT,
        description TEXT NOT NULL,
        category TEXT DEFAULT 'business',
        tags TEXT DEFAULT '',
        default_top TEXT,
        default_bottom TEXT,
        type TEXT DEFAULT 'image',
        created_at TIMESTAMP DEFAULT NOW()
      );

      ALTER TABLE facebook_pages ADD COLUMN IF NOT EXISTS access_token TEXT;
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS facebook_post_id TEXT;
    `);
    console.log('✅ PostgreSQL database schema verified and initialized.');
  } catch (error) {
    console.warn('Note: Could not run direct DDL schema verification (may already exist or using restricted user):', error);
  }
}

// --- Facebook Pages ---
export async function getPagesForUser(userId: number) {
  try {
    const list = await db.select().from(facebookPages).where(eq(facebookPages.userId, userId));
    return list;
  } catch (error) {
    console.error('Failed to get facebook pages:', error);
    throw new Error('Database error getting pages', { cause: error });
  }
}

export async function upsertFacebookPage(data: typeof facebookPages.$inferInsert) {
  try {
    const pageId = data.id || `page-${data.userId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const pageToInsert = {
      ...data,
      id: pageId,
    };

    const result = await db.insert(facebookPages)
      .values(pageToInsert)
      .onConflictDoUpdate({
        target: facebookPages.id,
        set: {
          userId: pageToInsert.userId,
          name: pageToInsert.name,
          category: pageToInsert.category,
          avatar: pageToInsert.avatar,
          followers: pageToInsert.followers,
          engagement: pageToInsert.engagement,
          isActive: pageToInsert.isActive,
          websiteUrl: pageToInsert.websiteUrl,
          businessDescription: pageToInsert.businessDescription,
          targetAudience: pageToInsert.targetAudience,
          offer: pageToInsert.offer,
          autoPilotEnabled: pageToInsert.autoPilotEnabled,
          autoPilotFrequency: pageToInsert.autoPilotFrequency,
          autoPilotHumor: pageToInsert.autoPilotHumor,
          brandAnalysis: pageToInsert.brandAnalysis,
          lastAutoRun: pageToInsert.lastAutoRun,
          accessToken: pageToInsert.accessToken,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to upsert facebook page:', error);
    throw new Error('Database error saving page', { cause: error });
  }
}

export async function setActivePageForUser(userId: number, pageId: string) {
  try {
    // Reset all other pages to isActive: false
    await db.update(facebookPages)
      .set({ isActive: false })
      .where(eq(facebookPages.userId, userId));

    // Set targeted page to isActive: true
    const result = await db.update(facebookPages)
      .set({ isActive: true })
      .where(and(eq(facebookPages.userId, userId), eq(facebookPages.id, pageId)))
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to set active page:', error);
    throw new Error('Database error updating active page', { cause: error });
  }
}

export async function deleteFacebookPage(userId: number, pageId: string) {
  try {
    const result = await db.delete(facebookPages)
      .where(and(eq(facebookPages.userId, userId), eq(facebookPages.id, pageId)))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to delete facebook page:', error);
    throw new Error('Database error deleting page', { cause: error });
  }
}

// --- Posts ---
export async function getPostsForUser(userId: number, pageId?: string) {
  try {
    const query = pageId
      ? and(eq(posts.userId, userId), eq(posts.pageId, pageId))
      : eq(posts.userId, userId);

    return await db.select().from(posts).where(query).orderBy(desc(posts.createdAt));
  } catch (error) {
    console.error('Failed to get posts:', error);
    throw new Error('Database error fetching posts', { cause: error });
  }
}

export async function createPostInDb(data: typeof posts.$inferInsert) {
  try {
    const postId = data.id || `post-${data.userId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const postToInsert = {
      ...data,
      id: postId,
    };

    const result = await db.insert(posts)
      .values(postToInsert)
      .onConflictDoUpdate({
        target: posts.id,
        set: {
          content: postToInsert.content,
          hashtags: postToInsert.hashtags,
          cta: postToInsert.cta,
          websiteUrl: postToInsert.websiteUrl,
          category: postToInsert.category,
          mediaType: postToInsert.mediaType,
          mediaUrl: postToInsert.mediaUrl,
          memeTopText: postToInsert.memeTopText,
          memeBottomText: postToInsert.memeBottomText,
          status: postToInsert.status,
          scheduledFor: postToInsert.scheduledFor,
          clicks: postToInsert.clicks,
          likes: postToInsert.likes,
          shares: postToInsert.shares,
          isAutonomous: postToInsert.isAutonomous,
          facebookPostId: postToInsert.facebookPostId,
        }
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to create post:', error);
    throw new Error('Database error creating post', { cause: error });
  }
}

export async function updatePostFacebookStatus(userId: number, postId: string, facebookPostId: string) {
  try {
    const [updated] = await db.update(posts)
      .set({
        status: 'published',
        facebookPostId,
      })
      .where(and(eq(posts.userId, userId), eq(posts.id, postId)))
      .returning();
    return updated;
  } catch (error) {
    console.error('Failed to update post facebook status:', error);
    throw error;
  }
}

export async function deletePostFromDb(userId: number, postId: string) {
  try {
    const result = await db.delete(posts)
      .where(and(eq(posts.userId, userId), eq(posts.id, postId)))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to delete post:', error);
    throw new Error('Database error deleting post', { cause: error });
  }
}

// --- Notifications ---
export async function getNotificationsForUser(userId: number) {
  try {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  } catch (error) {
    console.error('Failed to get notifications:', error);
    throw new Error('Database error fetching notifications', { cause: error });
  }
}

export async function createNotificationInDb(data: typeof notifications.$inferInsert) {
  try {
    const notifId = data.id || `notif-${data.userId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const notifToInsert = {
      ...data,
      id: notifId,
    };

    const result = await db.insert(notifications)
      .values(notifToInsert)
      .onConflictDoUpdate({
        target: notifications.id,
        set: {
          title: notifToInsert.title,
          message: notifToInsert.message,
          timestamp: notifToInsert.timestamp,
          read: notifToInsert.read,
          recapData: notifToInsert.recapData,
        }
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw new Error('Database error creating notification', { cause: error });
  }
}

export async function markAllNotificationsReadInDb(userId: number) {
  try {
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));
    return true;
  } catch (error) {
    console.error('Failed to mark notifications read:', error);
    throw new Error('Database error updating notifications', { cause: error });
  }
}

// --- SkyBoost Integration ---
export async function updateUserSkyboost(userId: number, data: {
  skyboostConnected: boolean;
  skyboostApiKey?: string;
  skyboostAccountEmail?: string;
  skyboostBalance?: string;
}) {
  try {
    const result = await db.update(users)
      .set({
        skyboostConnected: data.skyboostConnected,
        skyboostApiKey: data.skyboostApiKey || null,
        skyboostAccountEmail: data.skyboostAccountEmail || null,
        skyboostBalance: data.skyboostBalance || '25.00 €',
      })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to update SkyBoost settings:', error);
    throw new Error('Database error updating SkyBoost info', { cause: error });
  }
}

export async function boostPostWithSkyboost(userId: number, postId: string, likesToAdd: number, orderId: string) {
  try {
    const postRecord = await db.select().from(posts).where(and(eq(posts.id, postId), eq(posts.userId, userId))).limit(1);
    if (!postRecord.length) {
      throw new Error('Publication introuvable');
    }

    const currentLikes = postRecord[0].likes || 0;
    const result = await db.update(posts)
      .set({
        likes: currentLikes + likesToAdd,
        skyboostBoostRequested: true,
        skyboostTargetLikes: likesToAdd,
        skyboostOrderStatus: 'processing',
        skyboostOrderId: orderId,
      })
      .where(and(eq(posts.id, postId), eq(posts.userId, userId)))
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to boost post with SkyBoost:', error);
    throw new Error('Database error boosting post', { cause: error });
  }
}

// Seed Initial Data in PostgreSQL for new user (Clean by default, with option to seed demo)
export async function seedUserDataIfEmpty(userId: number, userEmail: string) {
  try {
    const existing = await getPagesForUser(userId);
    return existing;
  } catch (error) {
    console.error('Failed to get user data:', error);
    return [];
  }
}

export async function seedDemoPageForUser(userId: number) {
  try {
    const existing = await getPagesForUser(userId);
    if (existing && existing.length > 0) return existing;

    const p = await upsertFacebookPage({
      id: `page-${userId}-${Date.now()}`,
      userId,
      name: 'Ma Page Facebook',
      category: 'Product/service',
      avatar: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=200&q=80',
      followers: 1250,
      engagement: '7.2%',
      isActive: true,
      websiteUrl: 'https://monsite.com',
      businessDescription: 'Page Facebook prête à être connectée et synchronisée avec vos publications.',
      targetAudience: 'Clients et prospects sur Facebook',
      offer: 'Découvrez notre offre exclusive sur notre site web.',
      autoPilotEnabled: true,
      autoPilotFrequency: 'daily',
      autoPilotHumor: 'viral_spicy',
      lastAutoRun: 'Aujourd\'hui à 09:00',
      brandAnalysis: JSON.stringify({
        summary: 'Attirez des visiteurs qualifiés et convertissez votre audience Facebook en clients actifs.',
        idealAudience: 'Professionnels et particuliers à la recherche de vos produits ou services.',
        painPoints: [
          'Manque de régularité dans les publications Facebook',
          'Faible taux de clics vers le site web',
          'Difficulté à créer des visuels percutants sans y passer des heures'
        ],
        trafficHooks: [
          'Découvrez notre nouvelle offre spéciale en exclusivité 👇',
          'Comment booster vos résultats sans perdre de temps au quotidien :'
        ],
        memeAngles: [
          'Faire tout manuellement vs automatiser sa présence en ligne',
          'La réaction de nos clients quand ils découvrent notre offre'
        ],
        recommendedCtas: [
          '👉 Visitez notre site web pour en savoir plus',
          '🔗 Cliquez ici pour profiter de notre offre'
        ],
        contentPillars: [
          'Visuels et mèmes percutants',
          'Conseils pratiques et valeur ajoutée',
          'Témoignages et cas réels',
          'Lien direct vers les offres du site web'
        ]
      })
    });

    return [p];
  } catch (error) {
    console.error('Failed to seed demo page:', error);
    return [];
  }
}

// ==========================================
// 8. Meme Templates Management (PostgreSQL)
// ==========================================

export async function getMemeTemplates() {
  try {
    const list = await db.select().from(memeTemplates).orderBy(desc(memeTemplates.createdAt));
    return list;
  } catch (error) {
    console.error('Failed to get meme templates:', error);
    return [];
  }
}

export async function createMemeTemplate(data: typeof memeTemplates.$inferInsert) {
  try {
    const id = data.id || `meme-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const [created] = await db.insert(memeTemplates).values({
      ...data,
      id
    }).returning();
    return created;
  } catch (error) {
    console.error('Failed to create meme template:', error);
    throw error;
  }
}

export async function updateMemeTemplate(id: string, data: Partial<typeof memeTemplates.$inferInsert>) {
  try {
    const [updated] = await db.update(memeTemplates)
      .set(data)
      .where(eq(memeTemplates.id, id))
      .returning();
    return updated;
  } catch (error) {
    console.error('Failed to update meme template:', error);
    throw error;
  }
}

export async function deleteMemeTemplate(id: string) {
  try {
    const [deleted] = await db.delete(memeTemplates)
      .where(eq(memeTemplates.id, id))
      .returning();
    return deleted;
  } catch (error) {
    console.error('Failed to delete meme template:', error);
    throw error;
  }
}

export async function seedMemeTemplatesIfEmpty() {
  try {
    const existing = await db.select().from(memeTemplates).limit(1);
    if (existing.length > 0) return existing;

    const initial = [
      {
        id: 'meme-drake',
        title: 'Drake Hotline Bling (Choix Intelligent)',
        category: 'classique',
        imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
        description: 'Deux images comparatives : refus hautain en haut, approbation souriante et chaleureuse en bas.',
        defaultTop: 'PASSER 3 HEURES À PUBLIER MANUELLEMENT',
        defaultBottom: 'BRANCHER POSTPILOT ET REGARDER LE TRAFIC AFFLUER',
        tags: 'comparaison, productivité, choix, gain de temps',
        type: 'image'
      },
      {
        id: 'meme-distracted',
        title: 'Distracted Boyfriend (La Tentation)',
        category: 'classique',
        imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
        description: 'Un homme qui se retourne dans la rue pour reluquer une nouvelle opportunité alléchante pendant que sa petite amie le foudroie du regard.',
        defaultTop: 'MON ANCIENNE MÉTHODE DE PROSPECTION',
        defaultBottom: 'UN MÈME AUTOMATISÉ QUI RAMÈNE DES CLIENTS SUR MON SITE',
        tags: 'tentation, opportunité, concurrence, nouveauté',
        type: 'image'
      },
      {
        id: 'meme-rollsafe',
        title: 'Roll Safe (Penser Malin)',
        category: 'business',
        imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
        description: 'Un homme souriant pointant son index sur sa tempe avec un air complice et perspicace pour énoncer une vérité imparable.',
        defaultTop: 'TU NE PEUX PAS PERDRE D\'ARGENT EN PUBS FACEBOOK',
        defaultBottom: 'SI TES MÈMES VIRAUX REMPLISSENT DÉJÀ TON SITE GRATUITEMENT',
        tags: 'astuce, logique, intelligence, économies',
        type: 'image'
      },
      {
        id: 'meme-dicaprio',
        title: 'Leonardo DiCaprio Toast (La Célébration)',
        category: 'reaction',
        imageUrl: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
        description: 'Gatsby le Magnifique portant un toast avec son verre de champagne avec un sourire élégant et triomphant.',
        defaultTop: 'MOI ENTRAIN DE REGARDER POSTPILOT ATTIRER DES CLIENTS',
        defaultBottom: 'SUR MON SITE QUE J\'AI CRÉÉ AVEC FIERTÉ 😄',
        tags: 'succès, fête, victoire, satisfaction client',
        type: 'image'
      },
      {
        id: 'meme-two-buttons',
        title: 'Deux Boutons (Le Dilemme)',
        category: 'business',
        imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
        description: 'Un personnage en sueur hésite nerveusement avec angoisse entre deux boutons rouges étiquetés avec deux décisions opposées.',
        defaultTop: 'CONTINUER DE GALÉRER À CHERCHER DES PROSPECTS',
        defaultBottom: 'LAISSER LE PILOTE AUTOMATIQUE FAIRE LE JOB',
        tags: 'décision, hésitation, stress, solution',
        type: 'image'
      },
      {
        id: 'meme-expanding-brain',
        title: 'Expanding Brain (Niveau Cosmique)',
        category: 'classique',
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
        description: 'Évolution en 4 étapes de l\'intelligence humaine partant d\'un cerveau ordinaire jusqu\'à une illumination cosmique rayonnante.',
        defaultTop: 'PUBLIER UNE FOIS PAR MOIS SANS LIEN',
        defaultBottom: 'AUTOMATISER DES MÈMES AVEC LIEN DIRECT VERS LE SITE WEB',
        tags: 'évolution, stratégie, éveil, niveau supérieur',
        type: 'image'
      },
      {
        id: 'meme-video-celebration',
        title: 'Danse Triomphale (Mème Vidéo Boucle)',
        category: 'video_court',
        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-party-crowd-raising-hands-in-a-club-40545-large.mp4',
        description: 'Extrait vidéo court ultra dynamique et festif avec foule en liesse pour célébrer des ventes records sur le site.',
        defaultTop: 'QUAND LA NOTIFICATION "NOUVELLE COMMANDE SUR LE SITE" TOMBE',
        defaultBottom: 'MERCI LE PILOTE AUTOMATIQUE FACEBOOK 🔥',
        tags: 'vidéo, fête, ventes, conversion',
        type: 'video'
      }
    ];

    await db.insert(memeTemplates).values(initial);
    return await db.select().from(memeTemplates);
  } catch (error) {
    console.error('Failed to seed meme templates:', error);
    return [];
  }
}

// ==========================================
// 9. Subscription & Quota Enforcement
// ==========================================

export async function updateUserPlan(userId: number, plan: 'starter' | 'pro' | 'agency') {
  try {
    const [updated] = await db.update(users)
      .set({ plan })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  } catch (error) {
    console.error('Failed to update plan:', error);
    throw error;
  }
}

export async function incrementUserPostCount(userId: number) {
  try {
    const [updated] = await db.update(users)
      .set({ monthlyPostsCount: sql`COALESCE(${users.monthlyPostsCount}, 0) + 1` })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  } catch (error) {
    console.error('Failed to increment post count:', error);
  }
}

export async function incrementUserAnalysisCount(userId: number) {
  try {
    const [updated] = await db.update(users)
      .set({ monthlyAnalysesCount: sql`COALESCE(${users.monthlyAnalysesCount}, 0) + 1` })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  } catch (error) {
    console.error('Failed to increment analysis count:', error);
  }
}

// ==========================================
// 10. Administrator Endpoints & Queries
// ==========================================

export async function getAllUsersForAdmin() {
  try {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    const allPages = await db.select().from(facebookPages);
    const allPosts = await db.select().from(posts);

    // Attach counts
    return allUsers.map(u => ({
      ...u,
      pagesCount: allPages.filter(p => p.userId === u.id).length,
      postsCount: allPosts.filter(p => p.userId === u.id).length,
    }));
  } catch (error) {
    console.error('Failed to fetch admin users:', error);
    throw error;
  }
}

export async function updateUserByAdmin(userId: number, data: Partial<typeof users.$inferInsert>) {
  try {
    const [updated] = await db.update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();
    return updated;
  } catch (error) {
    console.error('Failed to update user by admin:', error);
    throw error;
  }
}

export async function getPlatformStats() {
  try {
    const allUsers = await db.select().from(users);
    const allPages = await db.select().from(facebookPages);
    const allPosts = await db.select().from(posts);
    const allTemplates = await db.select().from(memeTemplates);

    const boostedPosts = allPosts.filter(p => p.skyboostBoostRequested);

    return {
      totalUsers: allUsers.length,
      totalActivePages: allPages.filter(p => p.isActive).length,
      totalPages: allPages.length,
      totalPosts: allPosts.length,
      totalBoostedOrders: boostedPosts.length,
      totalMemeTemplates: allTemplates.length,
    };
  } catch (error) {
    console.error('Failed to get platform stats:', error);
    return {
      totalUsers: 0,
      totalActivePages: 0,
      totalPages: 0,
      totalPosts: 0,
      totalBoostedOrders: 0,
      totalMemeTemplates: 0,
    };
  }
}
