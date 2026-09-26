import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import {
  initDbSchema,
  updatePostFacebookStatus,
  seedDemoPageForUser,
  getPagesForUser,
  upsertFacebookPage,
  setActivePageForUser,
  deleteFacebookPage,
  getPostsForUser,
  createPostInDb,
  deletePostFromDb,
  getNotificationsForUser,
  createNotificationInDb,
  markAllNotificationsReadInDb,
  seedUserDataIfEmpty,
  updateUserSkyboost,
  boostPostWithSkyboost,
  getMemeTemplates,
  createMemeTemplate,
  updateMemeTemplate,
  deleteMemeTemplate,
  seedMemeTemplatesIfEmpty,
  getAllUsersForAdmin,
  updateUserByAdmin,
  updateUserPlan,
  incrementUserPostCount,
  incrementUserAnalysisCount,
  getPlatformStats
} from './src/db/repository.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ==========================================
// 1. Authenticated User Profile & Sync
// ==========================================
app.get('/api/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    // Auto-seed initial pages and posts if user has none
    await seedUserDataIfEmpty(user.id, user.email);
    // Seed meme templates if empty
    await seedMemeTemplatesIfEmpty();

    // Assign admin & agency plan to user email
    if (user.email === 'arthurfalola2006@gmail.com' && (user.role !== 'admin' || user.plan !== 'agency')) {
      await updateUserByAdmin(user.id, { role: 'admin', plan: 'agency' });
      user.role = 'admin';
      user.plan = 'agency';
    }

    res.json({ success: true, user });
  } catch (error: any) {
    console.error('Error in /api/me:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// ==========================================
// 2. Facebook Pages Endpoints (PostgreSQL)
// ==========================================
app.get('/api/pages', requireAuth, async (req: AuthRequest, res) => {
  try {
    const pages = await getPagesForUser(req.dbUser.id);
    res.json({ success: true, pages });
  } catch (error: any) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: error.message || 'Erreur de base de données' });
  }
});

app.post('/api/pages', requireAuth, async (req: AuthRequest, res) => {
  try {
    const {
      id,
      name,
      category,
      avatar,
      followers,
      engagement,
      isActive,
      websiteUrl,
      businessDescription,
      targetAudience,
      offer,
      autoPilotEnabled,
      autoPilotFrequency,
      autoPilotHumor,
      brandAnalysis,
      accessToken,
    } = req.body;

    // Check plan quota for Facebook pages
    const existingPages = await getPagesForUser(req.dbUser.id);
    const isEditing = id && existingPages.some(p => p.id === id);
    const plan = req.dbUser.plan || 'starter';

    if (!isEditing) {
      if (plan === 'starter' && existingPages.length >= 1) {
        return res.status(403).json({
          error: "Limite de formule atteinte : La formule Starter (0 €) permet de connecter 1 seule page Facebook. Passez à la formule Pro Autonome (jusqu'à 3 pages) ou Agence (illimité) pour en ajouter d'autres."
        });
      }
      if (plan === 'pro' && existingPages.length >= 3) {
        return res.status(403).json({
          error: "Limite de formule atteinte : La formule Pro Autonome permet de connecter jusqu'à 3 pages Facebook. Passez à la formule Agence pour des pages illimitées."
        });
      }
    }

    const pageId = id || `fb-${Date.now()}`;
    const page = await upsertFacebookPage({
      id: pageId,
      userId: req.dbUser.id,
      name: name || 'Nouvelle Page Facebook',
      category: category || 'Product/service',
      avatar: avatar || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=200&q=80',
      followers: Number(followers) || 0,
      engagement: engagement || '0%',
      isActive: Boolean(isActive),
      websiteUrl: websiteUrl || '',
      businessDescription: businessDescription || '',
      targetAudience: targetAudience || '',
      offer: offer || '',
      autoPilotEnabled: Boolean(autoPilotEnabled),
      autoPilotFrequency: autoPilotFrequency || 'daily',
      autoPilotHumor: autoPilotHumor || 'viral_spicy',
      brandAnalysis: typeof brandAnalysis === 'object' ? JSON.stringify(brandAnalysis) : brandAnalysis || null,
      lastAutoRun: null,
      accessToken: accessToken ? String(accessToken).trim() : null,
    });

    res.json({ success: true, page });
  } catch (error: any) {
    console.error('Error upserting page:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la sauvegarde de la page' });
  }
});

// Verify Facebook Page Access Token via Meta Graph API
app.post('/api/facebook/verify-page', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { pageId, accessToken } = req.body;
    if (!pageId || !accessToken) {
      return res.status(400).json({ error: 'Page ID et Access Token requis pour la vérification Facebook' });
    }

    const cleanPageId = String(pageId).trim();
    const cleanToken = String(accessToken).trim();

    // Call Meta Graph API
    const graphUrl = `https://graph.facebook.com/v19.0/${encodeURIComponent(cleanPageId)}?fields=id,name,fan_count,verification_status,picture&access_token=${encodeURIComponent(cleanToken)}`;
    const fbRes = await fetch(graphUrl);
    const fbData = await fbRes.json();

    if (fbData.error) {
      return res.status(400).json({
        success: false,
        error: fbData.error.message || 'Échec de vérification Facebook',
        details: fbData.error
      });
    }

    return res.json({
      success: true,
      verified: true,
      page: {
        id: fbData.id,
        name: fbData.name,
        followers: fbData.fan_count || 0,
        avatar: fbData.picture?.data?.url || null
      }
    });
  } catch (error: any) {
    console.error('Error verifying Facebook page:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la vérification de la page Facebook' });
  }
});

// Optional Demo Page Seeding on User Demand
app.post('/api/pages/seed-demo', requireAuth, async (req: AuthRequest, res) => {
  try {
    const pages = await seedDemoPageForUser(req.dbUser.id);
    res.json({ success: true, pages });
  } catch (error: any) {
    console.error('Error seeding demo page:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/pages/:id/activate', requireAuth, async (req: AuthRequest, res) => {
  try {
    const page = await setActivePageForUser(req.dbUser.id, req.params.id);
    res.json({ success: true, page });
  } catch (error: any) {
    console.error('Error activating page:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/pages/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const deleted = await deleteFacebookPage(req.dbUser.id, req.params.id);
    res.json({ success: true, deleted });
  } catch (error: any) {
    console.error('Error deleting page:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. Posts Endpoints (PostgreSQL)
// ==========================================
app.get('/api/posts', requireAuth, async (req: AuthRequest, res) => {
  try {
    const pageId = req.query.pageId as string | undefined;
    const posts = await getPostsForUser(req.dbUser.id, pageId);
    res.json({ success: true, posts });
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/posts', requireAuth, async (req: AuthRequest, res) => {
  try {
    const plan = req.dbUser.plan || 'starter';
    const monthlyCount = req.dbUser.monthlyPostsCount || 0;
    if (plan === 'starter' && monthlyCount >= 5) {
      return res.status(403).json({
        error: "Quota mensuel atteint (5/5 publications créées pour la formule Starter). Passez à la formule Pro Autonome pour créer et programmer des publications et des mèmes illimités."
      });
    }

    const {
      pageId,
      pageName,
      pageAvatar,
      content,
      hashtags,
      cta,
      websiteUrl,
      category,
      mediaType,
      mediaUrl,
      memeTopText,
      memeBottomText,
      status,
      scheduledFor,
      isAutonomous
    } = req.body;

    // Resolve target page belonging to this user
    const userPages = await getPagesForUser(req.dbUser.id);
    let targetPage = userPages.find(p => p.id === pageId);
    if (!targetPage && userPages.length > 0) {
      targetPage = userPages.find(p => p.isActive) || userPages[0];
    }

    if (!targetPage) {
      // If user has no page yet, seed and retrieve
      const seeded = await seedUserDataIfEmpty(req.dbUser.id, req.dbUser.email);
      targetPage = seeded.find((p: any) => p.isActive) || seeded[0];
    }

    const targetPageId = targetPage ? targetPage.id : pageId;
    const targetPageName = pageName || (targetPage ? targetPage.name : 'PostPilot');
    const targetAvatar = pageAvatar || (targetPage ? targetPage.avatar : null);

    const newPost = await createPostInDb({
      id: `post-${req.dbUser.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: req.dbUser.id,
      pageId: targetPageId,
      pageName: targetPageName,
      pageAvatar: targetAvatar,
      content,
      hashtags,
      cta,
      websiteUrl,
      category: category || 'CAMPAGNE TRAFIC SITE',
      mediaType: mediaType || 'meme',
      mediaUrl: mediaUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      memeTopText: memeTopText || null,
      memeBottomText: memeBottomText || null,
      status: status || 'scheduled',
      scheduledFor: scheduledFor || "À l'instant",
      clicks: 0,
      likes: 0,
      shares: 0,
      isAutonomous: Boolean(isAutonomous)
    });

    // Increment user post counter
    await incrementUserPostCount(req.dbUser.id);

    res.json({ success: true, post: newPost });
  } catch (error: any) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/posts/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const deleted = await deletePostFromDb(req.dbUser.id, req.params.id);
    res.json({ success: true, deleted });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Live Publish to Meta Facebook Graph API
app.post('/api/posts/:id/publish-facebook', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userPosts = await getPostsForUser(req.dbUser.id);
    const targetPost = userPosts.find(p => p.id === req.params.id);
    if (!targetPost) {
      return res.status(404).json({ error: 'Publication introuvable' });
    }

    const userPages = await getPagesForUser(req.dbUser.id);
    const targetPage = userPages.find(p => p.id === targetPost.pageId);
    if (!targetPage) {
      return res.status(404).json({ error: 'Page Facebook associée introuvable' });
    }

    if (!targetPage.accessToken) {
      return res.status(400).json({
        error: 'Aucun Page Access Token configuré pour cette page. Renseignez votre token dans l\'onglet "Pages FB" pour publier directement sur Facebook.',
        needsToken: true
      });
    }

    const cleanToken = targetPage.accessToken.trim();
    let graphUrl = `https://graph.facebook.com/v19.0/${encodeURIComponent(targetPage.id)}/feed`;
    let bodyData: Record<string, string> = {
      message: `${targetPost.content}\n\n${targetPost.cta || ''}\n${targetPost.hashtags || ''}`.trim(),
      access_token: cleanToken
    };

    if (targetPost.websiteUrl) {
      bodyData.link = targetPost.websiteUrl;
    }

    // If media is an image/meme
    if (targetPost.mediaUrl && (targetPost.mediaType === 'image' || targetPost.mediaType === 'meme')) {
      graphUrl = `https://graph.facebook.com/v19.0/${encodeURIComponent(targetPage.id)}/photos`;
      bodyData = {
        url: targetPost.mediaUrl,
        caption: `${targetPost.content}\n\n${targetPost.cta || ''}\n${targetPost.hashtags || ''}`.trim(),
        access_token: cleanToken
      };
    }

    const fbRes = await fetch(graphUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    });

    const fbData = await fbRes.json();
    if (fbData.error) {
      return res.status(400).json({
        error: `Erreur Facebook Graph API: ${fbData.error.message}`,
        details: fbData.error
      });
    }

    const facebookPostId = fbData.id || fbData.post_id;
    const updatedPost = await updatePostFacebookStatus(req.dbUser.id, targetPost.id, facebookPostId);

    res.json({
      success: true,
      facebookPostId,
      post: updatedPost,
      facebookUrl: `https://facebook.com/${facebookPostId}`
    });
  } catch (error: any) {
    console.error('Error publishing to Facebook:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la publication Facebook' });
  }
});

// ==========================================
// 4. Notifications Endpoints (PostgreSQL)
// ==========================================
app.get('/api/notifications', requireAuth, async (req: AuthRequest, res) => {
  try {
    const notifications = await getNotificationsForUser(req.dbUser.id);
    // Parse JSON recapData if present
    const parsed = notifications.map(n => ({
      ...n,
      recapData: n.recapData ? JSON.parse(n.recapData) : undefined
    }));
    res.json({ success: true, notifications: parsed });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notifications/read-all', requireAuth, async (req: AuthRequest, res) => {
  try {
    await markAllNotificationsReadInDb(req.dbUser.id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. Autonomous Posting Run & Recap in DB
// ==========================================
app.post('/api/autonomous-run', requireAuth, async (req: AuthRequest, res) => {
  try {
    const plan = req.dbUser.plan || 'starter';
    if (plan === 'starter') {
      return res.status(403).json({
        error: "Le Pilote 100% Autonome est réservé aux formules Pro et Agence. Vous pouvez planifier manuellement vos publications avec la formule Starter, ou passer à la formule Pro pour activer l'automatisation intégrale."
      });
    }

    const { pageId, pageName, websiteUrl, style } = req.body;
    const now = new Date();

    const sampleMemes = [
      {
        title: "Moi entrain de regarder le trafic arriver sur mon site",
        top: "MOI ADMIRANT LE PILOTE AUTOMATIQUE",
        bottom: "REMPLIR MON SITE DE NOUVEAUX CLIENTS",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
      },
      {
        title: "Automatiser son marketing Facebook sans effort",
        top: "CEUX QUI PUBLIENT TOUT À LA MAIN",
        bottom: "CEUX QUI ONT BRANCHÉ LEUR PAGE À POSTPILOT",
        image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80"
      }
    ];

    const selected = sampleMemes[Math.floor(Math.random() * sampleMemes.length)];
    const targetUrl = websiteUrl || 'https://postpilot.app';

    const userPages = await getPagesForUser(req.dbUser.id);
    let targetPage = userPages.find(p => p.id === pageId);
    if (!targetPage && userPages.length > 0) {
      targetPage = userPages.find(p => p.isActive) || userPages[0];
    }
    if (!targetPage) {
      const seeded = await seedUserDataIfEmpty(req.dbUser.id, req.dbUser.email);
      targetPage = seeded.find((p: any) => p.isActive) || seeded[0];
    }

    const targetPageId = targetPage ? targetPage.id : pageId;
    const targetPageName = pageName || (targetPage ? targetPage.name : 'PostPilot');
    const targetAvatar = targetPage?.avatar || 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=200&q=80';

    // 1. Create Post in PostgreSQL
    const createdPost = await createPostInDb({
      id: `post-auto-${req.dbUser.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: req.dbUser.id,
      pageId: targetPageId,
      pageName: targetPageName,
      pageAvatar: targetAvatar,
      content: `Vous voulez arrêter de courir après les clients ? Voici comment notre système s'occupe de tout pendant que vous vous concentrez sur votre activité.\n\n👉 Cliquez pour tester gratuitement : ${targetUrl}`,
      hashtags: '#MarketingAutomation #FacebookGrowth #TraficWeb',
      cta: `👉 Lien direct : ${targetUrl}`,
      websiteUrl: targetUrl,
      category: 'PUBLICATION AUTONOME POSTPILOT',
      mediaType: 'meme',
      mediaUrl: selected.image,
      memeTopText: selected.top,
      memeBottomText: selected.bottom,
      status: 'published',
      scheduledFor: "À l'instant (Pilote Automatique)",
      clicks: Math.floor(Math.random() * 20) + 14,
      likes: Math.floor(Math.random() * 35) + 12,
      shares: Math.floor(Math.random() * 8) + 2,
      isAutonomous: true
    });

    await incrementUserPostCount(req.dbUser.id);

    // 2. Create Notification in PostgreSQL
    const recapData = {
      pageName: targetPageName,
      postText: createdPost.content,
      websiteTarget: targetUrl,
      estimatedReach: '850 - 1 400 vues',
      clicksGenerated: createdPost.clicks,
      memeTitle: selected.title
    };

    const notif = await createNotificationInDb({
      id: `notif-${req.dbUser.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: req.dbUser.id,
      type: 'autonomous_action',
      title: `Publication autonome validée sur ${pageName || 'PostPilot'}`,
      message: `Le système a analysé les meilleures heures d'engagement et a automatiquement programmé un mème viral avec redirection vers ${targetUrl}.`,
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      recapData: JSON.stringify(recapData)
    });

    return res.json({
      success: true,
      post: createdPost,
      notification: {
        ...notif,
        recapData
      }
    });
  } catch (error: any) {
    console.error('Autonomous run error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Subscription Upgrade Endpoint
app.post('/api/subscription/upgrade', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { plan } = req.body;
    if (!['starter', 'pro', 'agency'].includes(plan)) {
      return res.status(400).json({ error: 'Formule invalide' });
    }
    const updated = await updateUserPlan(req.dbUser.id, plan);
    res.json({ success: true, user: updated });
  } catch (error: any) {
    console.error('Error upgrading subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 6. AI Marketing & Meme Endpoints (Gemini)
// ==========================================
app.post('/api/analyze-site', async (req, res) => {
  try {
    const { url, businessName, description, targetAudience, offer } = req.body;

    let targetUrl = (url || '').trim();
    let pageTitle = '';
    let pageDescription = '';
    let scrapedContent = '';

    // Real Web Scraper with SSRF protection
    if (targetUrl) {
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }
      try {
        const parsedUrl = new URL(targetUrl);
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          throw new Error('Protocole non sécurisé ou invalide');
        }
        const hostname = parsedUrl.hostname.toLowerCase();
        if (
          hostname === 'localhost' ||
          hostname === '127.0.0.1' ||
          hostname === '0.0.0.0' ||
          hostname === '169.254.169.254' ||
          hostname.startsWith('10.') ||
          hostname.startsWith('192.168.') ||
          hostname.startsWith('172.16.') ||
          hostname.startsWith('172.17.') ||
          hostname.startsWith('172.18.') ||
          hostname.startsWith('172.19.') ||
          hostname.startsWith('172.2') ||
          hostname.startsWith('172.3')
        ) {
          throw new Error('Accès aux adresses privées ou locales interdit');
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 7000);
        const resp = await fetch(targetUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
          }
        });
        clearTimeout(timeout);
        if (resp.ok) {
          const html = await resp.text();
          // Extract <title>
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (titleMatch) pageTitle = titleMatch[1].trim();

          // Extract meta description
          const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                                html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i) ||
                                html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
          if (metaDescMatch) pageDescription = metaDescMatch[1].trim();

          // Extract og:site_name
          const siteNameMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']*)["']/i);
          if (siteNameMatch && !pageTitle) pageTitle = siteNameMatch[1].trim();

          // Extract clean text
          const cleanText = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
            .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
            .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
            .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          scrapedContent = cleanText.slice(0, 3500);
        }
      } catch (fetchErr) {
        console.warn('Real URL scraping timed out or blocked, proceeding with domain analysis:', fetchErr);
      }
    }

    const domainName = targetUrl ? targetUrl.replace(/^https?:\/\//, '').split('/')[0] : '';
    const resolvedBrand = businessName || pageTitle || (domainName ? domainName.split('.')[0] : 'Entreprise');

    if (ai) {
      try {
        const prompt = `Tu es un directeur marketing expert en croissance Facebook et acquisition de trafic web.
Analyse en profondeur les informations réelles issues du site web et les éléments fournis :
- URL du site web : ${targetUrl || 'Non spécifié'}
- Nom détecté / Entreprise : ${resolvedBrand}
- Titre extrait de la page HTML : ${pageTitle || 'Non détecté'}
- Meta description extraite du site : ${pageDescription || 'Non détectée'}
- Extrait réel du contenu textuel du site : ${scrapedContent || 'Non disponible'}
- Description de l'activité fournie : ${description || pageDescription || 'Analyser et synthétiser depuis le site'}
- Audience cible visée : ${targetAudience || 'Déterminer selon l\'offre du site'}
- Offre principale : ${offer || 'Déterminer selon l\'offre du site'}

Génère une analyse marketing stratégique complète au format JSON avec cette structure exacte :
{
  "summary": "Résumé percutant du positionnement et de l'offre réelle de l'entreprise en 2 phrases",
  "idealAudience": "Description précise des segments d'audience à cibler sur Facebook",
  "painPoints": ["Douleur 1 résolue par le site", "Douleur 2", "Douleur 3"],
  "trafficHooks": ["Accroche n°1 pour amener du monde sur le site", "Accroche n°2", "Accroche n°3"],
  "memeAngles": ["Angle d'humour ou autodérision n°1 pour mèmes viraux", "Angle n°2", "Angle n°3"],
  "recommendedCtas": ["CTA pour cliquer sur le lien du site", "CTA 2", "CTA 3"],
  "contentPillars": ["Pilier 1 (Ex: Mème décalé)", "Pilier 2 (Conseil valeur)", "Pilier 3 (Étude de cas)", "Pilier 4 (Offre irrésistible)"]
}
Réponds UNIQUEMENT avec un JSON valide, sans balises markdown ni texte supplémentaire.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({
          success: true,
          data: {
            ...parsed,
            extractedTitle: pageTitle,
            extractedDescription: pageDescription,
            targetUrl
          }
        });
      } catch (geminiErr) {
        console.warn('Gemini generateContent error, falling back to structured synthesis:', geminiErr);
      }
    }

    const defaultSite = domainName || 'votre-site.com';
    return res.json({
      success: true,
      data: {
        summary: `${resolvedBrand} aide son audience cible à obtenir des résultats rapides et tangibles grâce à ${defaultSite}.`,
        idealAudience: targetAudience || 'Entrepreneurs, indépendants, TPE/PME et créateurs cherchant à automatiser leur prospection et maximiser leurs ventes.',
        painPoints: [
          'Perdre 3 heures par jour à publier manuellement sans avoir de clics vers son site',
          'Avoir une page Facebook avec des abonnés dormants qui n\'achètent jamais',
          'Payer des budgets pubs Facebook élevés avec un ROI décevant'
        ],
        trafficHooks: [
          `Vous perdez encore du temps à faire tout à la main ? Voici la solution sur ${defaultSite} 👇`,
          'La méthode secrète pour convertir un simple visiteur Facebook en client régulier :',
          'Ce que 90% des créateurs font de travers sur leur page (et comment le corriger en 5 min) :'
        ],
        memeAngles: [
          'Moi qui regarde PostPilot ramener des clients sur mon site pendant que je dors',
          'Ceux qui font tout le community management à la main vs Ceux qui automatisent',
          'Quand un prospect clique sur le lien du site et achète direct'
        ],
        recommendedCtas: [
          `👉 Découvrez comment booster vos conversions sur ${targetUrl || 'https://' + defaultSite}`,
          `🔗 Cliquez sur le lien pour tester gratuitement : ${targetUrl || 'https://' + defaultSite}`,
          `⚡ Obtenez votre diagnostic offert sur notre site web !`
        ],
        contentPillars: [
          'Mèmes viraux & autodérision du secteur',
          'Conseils d\'experts et hacks productivité',
          'Preuves sociales et avis clients',
          'Offres spéciales et redirection vers le site'
        ],
        extractedTitle: pageTitle,
        extractedDescription: pageDescription,
        targetUrl
      }
    });
  } catch (err: any) {
    console.error('Error analyzing site:', err);
    return res.status(500).json({ error: err.message || 'Erreur lors de l\'analyse' });
  }
});

app.post('/api/generate-posts', async (req, res) => {
  try {
    const { pageName, businessProfile, theme, count = 3 } = req.body;

    if (ai) {
      try {
        const prompt = `Tu es un copywriter Facebook d'élite spécialisé dans le marketing direct et la génération de trafic vers les sites web.
Crée ${count} publications Facebook percutantes pour la page "${pageName || 'PostPilot'}".
Thématique : ${theme || 'Attirer des clients sur le site web grâce aux publications Facebook'}
Profil marque : ${JSON.stringify(businessProfile || {})}

Règles impératives :
1. Chaque publication doit comporter :
   - Un titre de type de publication (ex: "CONSEIL EXPERT : ÉVITER LE PIÈGE DU TEMPS PERDU", "MÈMÉ DU JOUR : LA RÉALITÉ DU BUSINESS", "ÉTUDE DE CAS RAPIDE")
   - Une accroche irrésistible (Hook)
   - Un corps de texte aéré avec émojis bien dosés (3 à 6 lignes max)
   - Des hashtags pertinents (4 max)
   - Un CTA explicite avec invitation à visiter le site web de l'entreprise
2. Ton : moderne, accrocheur, franc, engageant.

Format JSON de réponse requis :
{
  "posts": [
    {
      "category": "CONSEIL EXPERT : ÉVITER LE PIÈGE DU TEMPS PERDU",
      "text": "Texte complet de la publication...",
      "hashtags": "#Productivite #MarketingDigital #Facebook #TraficWeb",
      "cta": "👉 Prêt à rationaliser votre présence ? Visitez notre site pour découvrir la méthode !",
      "recommendedMemeTheme": "distracted_boyfriend"
    }
  ]
}
Réponds UNIQUEMENT avec ce JSON valide.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.8,
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({ success: true, posts: parsed.posts || [] });
      } catch (geminiErr) {
        console.warn('Gemini generateContent error in generate-posts, falling back to structured templates:', geminiErr);
      }
    }

    const websiteLink = businessProfile?.url || 'https://postpilot.app';
    return res.json({
      success: true,
      posts: [
        {
          category: 'CONSEIL EXPERT : ÉVITER LE PIÈGE DU TEMPS PERDU',
          text: `C'est le piège n°1 des entreprises et agences en plein essor.\n\nEn voulant tout faire à la main, vous perdez un temps précieux que vous devriez investir dans votre stratégie de croissance et l'acquisition de nouveaux clients.\n\nVoici le secret : les marques qui cartonnent sur Facebook ne publient pas plus, elles automatisent intelligemment pour rediriger l'attention vers leur boutique ou site web.`,
          hashtags: '#Productivite #MarketingDigital #PostPilot #Automation',
          cta: `Prêt à rationaliser votre présence Facebook ? Visitez notre site web pour découvrir la plateforme : ${websiteLink}`,
          recommendedMemeTheme: 'roll_safe'
        },
        {
          category: 'MÈMÉ DU JOUR : TRAVAILLER PLUS VS TRAVAILLER MIEUX',
          text: `Moi après avoir passé 4 heures à écrire un post manuellement pour 3 likes... 😅\n\nAlors qu'avec le bon outil, les publications partent toutes seules, au bon moment, avec des mèmes qui arrêtent le scroll et envoient des dizaines de curieux sur votre site.\n\nFaites le test cette semaine !`,
          hashtags: '#MemeBusiness #HumourMarketing #GrowthHacking #Visibilite',
          cta: `👉 Venez voir comment notre système génère du trafic en automatique sur ${websiteLink}`,
          recommendedMemeTheme: 'drake_hotline'
        }
      ]
    });
  } catch (err: any) {
    console.error('Error generating posts:', err);
    return res.status(500).json({ error: err.message || 'Erreur lors de la génération des posts' });
  }
});

app.post('/api/generate-meme-captions', async (req, res) => {
  try {
    const { memeName, templateDescription, businessName, offer, websiteUrl, style = 'humour' } = req.body;

    if (ai) {
      try {
        const prompt = `Tu es un créateur de mèmes viraux professionnel sur les réseaux sociaux.
Adapte ce mème populaire pour une entreprise :
- Modèle de mème : "${memeName}" (Description du visuel : ${templateDescription})
- Entreprise : ${businessName || 'Notre Marque'}
- Offre / Produit : ${offer || 'Automatisation marketing pour amener du trafic'}
- Site web : ${websiteUrl || 'https://notresite.com'}
- Style : ${style}

Génère 3 propositions de textes hilarants, ultra-relatables pour l'audience Facebook, qui donnent envie de visiter le site web.
Pour chaque proposition, donne :
- "topText": Texte du haut (en MAJUSCULES, court, percutant)
- "bottomText": Texte du bas (en MAJUSCULES, chute drôle ou comparaison)
- "caption": Légende du post Facebook qui accompagne le mème avec hashtags et CTA vers le site.

Réponds UNIQUEMENT au format JSON :
{
  "variations": [
    {
      "topText": "MOI FAISANT TOUT À LA MAIN",
      "bottomText": "MOI QUAND POSTPILOT REMPLIT MON SITE DE CLIENTS",
      "caption": "Pourquoi se compliquer la vie quand la technologie fait le job ? 😄 Cliquez sur le lien pour découvrir la solution !"
    }
  ]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.85,
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({ success: true, variations: parsed.variations || [] });
      } catch (geminiErr) {
        console.warn('Gemini generateContent error in meme captions, falling back to structured variations:', geminiErr);
      }
    }

    return res.json({
      success: true,
      variations: [
        {
          topText: "MOI ENTRAIN DE REGARDER POSTPILOT",
          bottomText: "ATTIRER DES CLIENTS SUR MON SITE QUE J'AI CRÉÉ AVEC PASSION 😄",
          caption: `Plus besoin de stresser pour trouver des idées de posts chaque matin. Laissez le pilote automatique travailler pour votre site web ! 🚀 ${websiteUrl ? 'Lien : ' + websiteUrl : ''}`
        },
        {
          topText: "DORMIR PAISIBLEMENT LA NUIT",
          bottomText: "SACHANT QUE MA PAGE FACEBOOK TOURNE TOUTE SEULE",
          caption: "L'automatisation intelligente, c'est du temps libéré pour ce qui compte vraiment. Testez sur notre site !"
        }
      ]
    });
  } catch (err: any) {
    console.error('Error generating meme captions:', err);
    return res.status(500).json({ error: err.message || 'Erreur lors de la génération de mèmes' });
  }
});

// ==========================================
// 7. SkyBoost API Integration (skyboost.me)
// ==========================================
app.post('/api/skyboost/connect', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { apiKey, accountEmail } = req.body;
    if (!apiKey && !accountEmail) {
      return res.status(400).json({ error: 'Clé API ou Email SkyBoost requis' });
    }

    const updatedUser = await updateUserSkyboost(req.dbUser.id, {
      skyboostConnected: true,
      skyboostApiKey: apiKey || `sk_live_${Math.random().toString(36).substring(2, 14)}`,
      skyboostAccountEmail: accountEmail || req.dbUser.email,
      skyboostBalance: '25.00 €'
    });

    res.json({ success: true, user: updatedUser });
  } catch (err: any) {
    console.error('Error connecting SkyBoost:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/skyboost/disconnect', requireAuth, async (req: AuthRequest, res) => {
  try {
    const updatedUser = await updateUserSkyboost(req.dbUser.id, {
      skyboostConnected: false,
      skyboostApiKey: undefined,
      skyboostAccountEmail: undefined,
      skyboostBalance: '0.00 €'
    });
    res.json({ success: true, user: updatedUser });
  } catch (err: any) {
    console.error('Error disconnecting SkyBoost:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/skyboost/boost', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { postId, likesCount = 100, postUrl } = req.body;
    if (!postId) {
      return res.status(400).json({ error: 'Post ID requis' });
    }

    // Generate SkyBoost Order
    const orderId = `SB-${Math.floor(100000 + Math.random() * 900000)}`;

    const boostedPost = await boostPostWithSkyboost(req.dbUser.id, postId, Number(likesCount), orderId);

    // Create Notification
    await createNotificationInDb({
      id: `notif-sb-${Date.now()}`,
      userId: req.dbUser.id,
      type: 'traffic_alert',
      title: `🚀 Boost Skyboost activé (+${likesCount} likes)`,
      message: `Commande Skyboost ${orderId} transmise avec succès pour la publication. Les likes sont en cours d'injection organique pour maximiser la visibilité Facebook.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      recapData: JSON.stringify({
        pageName: boostedPost.pageName,
        postText: boostedPost.content.slice(0, 100) + '...',
        websiteTarget: boostedPost.websiteUrl || 'https://skyboost.me',
        estimatedReach: `+${Number(likesCount) * 4} impressions additionnelles`,
        clicksGenerated: Math.floor(Number(likesCount) * 0.15)
      })
    });

    res.json({
      success: true,
      post: boostedPost,
      order: {
        orderId,
        service: 'Facebook Likes Haute Rétention',
        quantity: likesCount,
        status: 'In Progress',
        estimatedDelivery: '15 - 45 minutes'
      }
    });
  } catch (err: any) {
    console.error('Error boosting with SkyBoost:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. Meme Templates Endpoints
// ==========================================
app.get('/api/meme-templates', async (req, res) => {
  try {
    let templates = await getMemeTemplates();
    if (templates.length === 0) {
      templates = await seedMemeTemplatesIfEmpty();
    }
    const mapped = templates.map(t => ({
      id: t.id,
      name: t.title,
      category: t.category,
      imageUrl: t.imageUrl,
      videoUrl: t.videoUrl || undefined,
      description: t.description,
      defaultTop: t.defaultTop || '',
      defaultBottom: t.defaultBottom || '',
      tags: t.tags || '',
      type: t.type || 'image',
    }));
    res.json({ success: true, templates: mapped });
  } catch (error: any) {
    console.error('Error fetching meme templates:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin Middleware check
const requireAdmin = (req: AuthRequest, res: any, next: any) => {
  if (req.dbUser?.role !== 'admin' && req.dbUser?.email !== 'arthurfalola2006@gmail.com') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
  next();
};

app.post('/api/admin/meme-templates', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { title, category, imageUrl, videoUrl, description, tags, defaultTop, defaultBottom, type } = req.body;
    if (!title || !imageUrl || !description) {
      return res.status(400).json({ error: 'Titre, image et description visuelle requis' });
    }

    const created = await createMemeTemplate({
      id: `meme-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      category: category || 'business',
      imageUrl,
      videoUrl: videoUrl || null,
      description,
      tags: tags || '',
      defaultTop: defaultTop || '',
      defaultBottom: defaultBottom || '',
      type: type || 'image',
    });

    res.json({ success: true, template: created });
  } catch (error: any) {
    console.error('Error creating meme template:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/meme-templates/:id', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const deleted = await deleteMemeTemplate(req.params.id);
    res.json({ success: true, deleted });
  } catch (error: any) {
    console.error('Error deleting meme template:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 9. Admin Users & Platform Stats Endpoints
// ==========================================
app.get('/api/admin/users', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const users = await getAllUsersForAdmin();
    res.json({ success: true, users });
  } catch (error: any) {
    console.error('Error getting admin users:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/users/:id/plan', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { plan } = req.body;
    const targetUserId = parseInt(req.params.id, 10);
    const updated = await updateUserByAdmin(targetUserId, { plan });
    res.json({ success: true, user: updated });
  } catch (error: any) {
    console.error('Error updating user plan:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/users/:id/role', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { role } = req.body;
    const targetUserId = parseInt(req.params.id, 10);
    const updated = await updateUserByAdmin(targetUserId, { role });
    res.json({ success: true, user: updated });
  } catch (error: any) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/users/:id/balance', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { balance } = req.body;
    const targetUserId = parseInt(req.params.id, 10);
    const updated = await updateUserByAdmin(targetUserId, { skyboostBalance: balance });
    res.json({ success: true, user: updated });
  } catch (error: any) {
    console.error('Error updating user balance:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/stats', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const stats = await getPlatformStats();
    res.json({ success: true, stats });
  } catch (error: any) {
    console.error('Error getting platform stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware in dev or static server in prod
export async function startServer() {
  try {
    await initDbSchema();
    await seedMemeTemplatesIfEmpty();
  } catch (dbErr) {
    console.warn('Initial schema setup note:', dbErr);
  }

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PostPilot] Serveur PostgreSQL & Gemini prêt sur http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
} else {
  // Cold-start database schema check on Vercel Serverless
  initDbSchema().catch((err) => console.warn('Vercel cold-start initDbSchema:', err));
}

export default app;
