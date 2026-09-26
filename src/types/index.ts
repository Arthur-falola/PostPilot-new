export interface FacebookPage {
  id: string;
  name: string;
  category: string;
  avatar: string;
  followers: number;
  engagement: string;
  isActive: boolean;
  websiteUrl: string;
  businessDescription: string;
  targetAudience: string;
  offer: string;
  autoPilotEnabled: boolean;
  autoPilotFrequency: 'daily' | 'twice_daily' | 'thrice_weekly';
  autoPilotHumor: 'subtle' | 'viral_spicy' | 'relatable';
  lastAutoRun?: string;
  accessToken?: string;
  brandAnalysis?: {
    summary: string;
    idealAudience: string;
    painPoints: string[];
    trafficHooks: string[];
    memeAngles: string[];
    recommendedCtas: string[];
    contentPillars: string[];
  };
}

export interface Post {
  id: string;
  pageId: string;
  pageName: string;
  pageAvatar: string;
  content: string;
  hashtags: string;
  cta: string;
  websiteUrl: string;
  category?: string;
  mediaType: 'image' | 'meme' | 'video';
  mediaUrl: string;
  memeTopText?: string;
  memeBottomText?: string;
  status: 'scheduled' | 'published' | 'draft';
  scheduledFor: string;
  createdAt: string;
  clicks: number;
  likes: number;
  shares: number;
  isAutonomous?: boolean;
  skyboostBoostRequested?: boolean;
  skyboostTargetLikes?: number;
  skyboostOrderStatus?: 'none' | 'pending' | 'processing' | 'completed';
  skyboostOrderId?: string;
  facebookPostId?: string;
}

export interface UserProfile {
  id: number;
  uid: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
  role?: 'user' | 'admin';
  plan?: 'starter' | 'pro' | 'agency';
  monthlyPostsCount?: number;
  monthlyAnalysesCount?: number;
  fbConnected: boolean;
  fbAccessToken?: string;
  skyboostConnected?: boolean;
  skyboostApiKey?: string;
  skyboostAccountEmail?: string;
  skyboostBalance?: string;
}

export interface MemeTemplate {
  id: string;
  name: string;
  category: 'classique' | 'business' | 'video_court' | 'reaction';
  imageUrl: string;
  videoUrl?: string;
  description: string;
  defaultTop: string;
  defaultBottom: string;
  type: 'image' | 'video';
  tags?: string;
}

export interface CommunityTemplate {
  id: string;
  title: string;
  niche: 'SaaS & Tech' | 'E-commerce' | 'Freelance & Agence' | 'Coaching & Formation' | 'Artisan & Local';
  author: string;
  authorAvatar: string;
  performance: string;
  clicksGenerated: number;
  content: string;
  hashtags: string;
  cta: string;
  memeTemplateId: string;
  topText: string;
  bottomText: string;
  mediaUrl: string;
}

export interface NotificationItem {
  id: string;
  type: 'autonomous_action' | 'traffic_alert' | 'daily_ideas' | 'system';
  title: string;
  message: string;
  timestamp: string;
  date?: string;
  read: boolean;
  userId?: number;
  recapData?: {
    pageName: string;
    postText?: string;
    websiteTarget: string;
    estimatedReach?: string;
    clicksGenerated?: number;
    memeTitle?: string;
  };
}

export interface DailyIdea {
  id: string;
  category: string;
  title: string;
  content: string;
  hashtags: string;
  cta: string;
  recommendedMemeId: string;
  trafficAngle: string;
}
