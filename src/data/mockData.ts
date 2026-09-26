import { FacebookPage, Post, MemeTemplate, CommunityTemplate, NotificationItem, DailyIdea } from '../types';

export const INITIAL_PAGES: FacebookPage[] = [
  {
    id: '666722626513948',
    name: 'SkyBoost',
    category: 'Product/service',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    followers: 11,
    engagement: '—',
    isActive: false,
    websiteUrl: 'https://skyboost-digital.com',
    businessDescription: 'Plateforme d\'accélération de visibilité et d\'acquisition de prospects pour marques digitales.',
    targetAudience: 'Créateurs de contenu, e-commerçants, startups en phase d\'acquisition.',
    offer: 'Audit gratuit et boost automatique de conversions.',
    autoPilotEnabled: true,
    autoPilotFrequency: 'daily',
    autoPilotHumor: 'relatable',
    lastAutoRun: 'Hier à 18:30'
  },
  {
    id: '810748425460613',
    name: 'Skyboost',
    category: 'Digital creator',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    followers: 723,
    engagement: '—',
    isActive: false,
    websiteUrl: 'https://skyboost.agency',
    businessDescription: 'Agence spécialisée dans les contenus courts viraux et la conversion Facebook Ads vers sites e-commerce.',
    targetAudience: 'Marques D2C, boutiques Shopify, indépendants.',
    offer: 'Création de campagnes visuelles sans effort.',
    autoPilotEnabled: false,
    autoPilotFrequency: 'thrice_weekly',
    autoPilotHumor: 'viral_spicy'
  },
  {
    id: '994821034185210',
    name: 'PostPilot',
    category: 'Social Media Agency',
    avatar: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=200&q=80',
    followers: 1840,
    engagement: '8.4%',
    isActive: true,
    websiteUrl: 'https://postpilot.app',
    businessDescription: 'L\'assistant marketing autonome qui transforme vos abonnés Facebook en clients sur votre site web via des mèmes viraux et la planification intelligente.',
    targetAudience: 'Entrepreneurs, solopreneurs, agences et commerces qui veulent automatiser sans dépenser une fortune en pubs.',
    offer: 'Génération de campagnes automatisées et acquisition de trafic web.',
    autoPilotEnabled: true,
    autoPilotFrequency: 'daily',
    autoPilotHumor: 'viral_spicy',
    lastAutoRun: "Aujourd'hui à 09:15",
    brandAnalysis: {
      summary: 'PostPilot propulse les ventes des entreprises en transformant le scroll passif de Facebook en visites qualifiées sur leur site web.',
      idealAudience: 'PME, indépendants, formateurs, créateurs et agences débordés par la gestion manuelle de leurs réseaux.',
      painPoints: [
        'Perte de 2 à 4 heures par semaine pour rédiger des posts avec peu d\'impact',
        'Zéro visiteur généré vers le site malgré les publications quotidiennes',
        'Coût exorbitant de la génération d\'images IA ou des agences traditionnelles'
      ],
      trafficHooks: [
        'Comment attirer 500 nouveaux visiteurs sur votre site chaque semaine sans payer de pub :',
        'Moi regardant le trafic Facebook affluer sur mon site pendant que je bois mon café :',
        'La méthode 100% automatisée pour transformer vos abonnés en acheteurs :'
      ],
      memeAngles: [
        'Moi faisant tout à la main vs PostPilot en pilote automatique',
        'Quand le client dit qu\'il a découvert notre site grâce à un mème Facebook',
        'Dépenser 1000€ en pubs vs 1 mème viral bien ciblé'
      ],
      recommendedCtas: [
        '👉 Découvrez comment automatiser votre acquisition sur postpilot.app',
        '🔗 Testez le pilote automatique gratuitement sur notre site web',
        '⚡ Cliquez ici pour booster vos visites dès aujourd\'hui !'
      ],
      contentPillars: [
        'Mèmes business décalés & autodérision',
        'Astuces productivité & gain de temps',
        'Cas clients & chiffres réels de conversion',
        'Lancement d\'offres et liens directs site'
      ]
    }
  }
];

export const MEME_TEMPLATES: MemeTemplate[] = [
  {
    id: 'meme-drake',
    name: 'Drake Hotline Bling (Choix Intelligent)',
    category: 'classique',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    description: 'Deux images comparatives : refus hautain en haut, approbation souriante en bas.',
    defaultTop: 'PASSER 3 HEURES À PUBLIER MANUELLEMENT',
    defaultBottom: 'BRANCHER POSTPILOT ET REGARDER LE TRAFIC AFFLUER',
    type: 'image'
  },
  {
    id: 'meme-distracted',
    name: 'Distracted Boyfriend (La Tentation)',
    category: 'classique',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    description: 'Un homme qui se retourne pour regarder une autre opportunité pendant que sa copine le regarde furieuse.',
    defaultTop: 'MON ANCIENNE MÉTHODE DE PROSPECTION',
    defaultBottom: 'UN MÈME AUTOMATISÉ QUI RAMÈNE DES CLIENTS SUR MON SITE',
    type: 'image'
  },
  {
    id: 'meme-rollsafe',
    name: 'Roll Safe (Penser Malin)',
    category: 'business',
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    description: 'Homme souriant pointant son doigt sur sa tempe avec ingéniosité.',
    defaultTop: 'TU NE PEUX PAS PERDRE D\'ARGENT EN PUBS FACEBOOK',
    defaultBottom: 'SI TES MÈMES VIRAUX REMPLISSENT DÉJÀ TON SITE GRATUITEMENT',
    type: 'image'
  },
  {
    id: 'meme-dicaprio',
    name: 'Leonardo DiCaprio Toast (La Célébration)',
    category: 'reaction',
    imageUrl: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
    description: 'Gatsby portant un toast avec son verre avec un sourire triomphant.',
    defaultTop: 'MOI ENTRAIN DE REGARDER POSTPILOT ATTIRER DES CLIENTS',
    defaultBottom: 'SUR MON SITE QUE J\'AI CRÉÉ AVEC FIERTÉ 😄',
    type: 'image'
  },
  {
    id: 'meme-two-buttons',
    name: 'Deux Boutons (Le Dilemme)',
    category: 'business',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    description: 'Personnage stressé transpirant devant deux choix décisifs.',
    defaultTop: 'CONTINUER DE GALÉRER À CHERCHER DES PROSPECTS',
    defaultBottom: 'LAISSER LE PILOTE AUTOMATIQUE FAIRE LE JOB',
    type: 'image'
  },
  {
    id: 'meme-expanding-brain',
    name: 'Expanding Brain (Niveau Cosmique)',
    category: 'classique',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    description: 'Évolution du cerveau de petit à illuminé dans le cosmos.',
    defaultTop: 'PUBLIER UNE FOIS PAR MOIS SANS LIEN',
    defaultBottom: 'AUTOMATISER DES MÈMES AVEC LIEN DIRECT VERS LE SITE WEB',
    type: 'image'
  },
  {
    id: 'meme-video-celebration',
    name: 'Danse Triomphale (Mème Vidéo Boucle)',
    category: 'video_court',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-party-crowd-raising-hands-in-a-club-40545-large.mp4',
    description: 'Extrait vidéo court ultra dynamique pour célébrer l\'arrivée de nouveaux clients.',
    defaultTop: 'QUAND LA NOTIFICATION "NOUVELLE COMMANDE SUR LE SITE" TOMBE',
    defaultBottom: 'MERCI LE PILOTE AUTOMATIQUE FACEBOOK 🔥',
    type: 'video'
  },
  {
    id: 'meme-video-typing',
    name: 'Travail en Furie (Mème Vidéo Loop)',
    category: 'video_court',
    imageUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-typing-fast-on-a-computer-keyboard-41312-large.mp4',
    description: 'Vidéo courte de frappe ultra rapide au clavier pour illustrer l\'intensité ou l\'automatisation.',
    defaultTop: 'MOI ESSAYANT DE RÉPONDRE À TOUS LES MESSAGES DU SITE',
    defaultBottom: 'APRÈS LE DERNIER POST VIRAL POSTPILOT ⚡',
    type: 'video'
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    pageId: '994821034185210',
    pageName: 'PostPilot',
    pageAvatar: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=200&q=80',
    content: "C'est le piège n°1 des entreprises et agences en plein essor.\n\nEn voulant tout faire à la main, vous perdez un temps précieux que vous devriez investir dans votre stratégie de croissance.\n\nVoici 3 leviers simples à mettre en place dès aujourd'hui pour attirer des clients réguliers sur votre site web sans y passer vos journées :",
    hashtags: '#Productivite #MarketingDigital #PostPilot #Automation',
    cta: 'Prêt à rationaliser votre présence Facebook ? Visitez notre site web pour découvrir la plateforme !',
    websiteUrl: 'https://postpilot.app',
    category: 'CONSEIL EXPERT : ÉVITER LE PIÈGE DU TEMPS PERDU',
    mediaType: 'meme',
    mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    memeTopText: 'MOI FAISANT TOUT LE MARKETING À LA MAIN',
    memeBottomText: 'MOI DÉCOUVRANT QUE LE PILOTE AUTOMATIQUE EXISTE',
    status: 'scheduled',
    scheduledFor: 'Demain à 10:00',
    createdAt: '2026-09-25 08:30',
    clicks: 142,
    likes: 89,
    shares: 24,
    isAutonomous: false
  },
  {
    id: 'post-2',
    pageId: '994821034185210',
    pageName: 'PostPilot',
    pageAvatar: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=200&q=80',
    content: "Moi entrain de regarder PostPilot attirer des clients sur mon site que j'ai créé avec passion 😄\n\nArrêtez de gaspiller des centaines d'euros en publicités mal ciblées. Des visuels mèmes accrocheurs + un message percutant génèrent 10x plus d'engagement organique.",
    hashtags: '#Entrepreneuriat #CroissanceWeb #MemeMarketing #FacebookTips',
    cta: '👉 Cliquez sur le lien dans notre bio ou visitez notre site pour démarrer !',
    websiteUrl: 'https://postpilot.app',
    category: 'MÈMÉ DU JOUR : TRAFIC ORGANIQUE',
    mediaType: 'meme',
    mediaUrl: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
    memeTopText: 'MOI ENTRAIN DE REGARDER POSTPILOT ATTIRER DES CLIENTS',
    memeBottomText: "SUR MON SITE QUE J'AI CRÉÉ AVEC PASSION 😄",
    status: 'published',
    scheduledFor: 'Hier à 14:00',
    createdAt: '2026-09-24 14:00',
    clicks: 348,
    likes: 312,
    shares: 67,
    isAutonomous: true
  },
  {
    id: 'post-3',
    pageId: '666722626513948',
    pageName: 'SkyBoost',
    pageAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    content: "Votre texte apparaîtra ici en temps réel au fur et à mesure de votre saisie...\n\nBoostez vos résultats avec un contenu optimisé pour votre audience cible.",
    hashtags: '#Fitness #Nutrition #BienEtre',
    cta: 'Visitez notre boutique pour profiter de 20% sur la nouvelle collection !',
    websiteUrl: 'https://skyboost-digital.com',
    category: 'OFFRE SPÉCIALE',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    status: 'scheduled',
    scheduledFor: '07/09/2026 10:00',
    createdAt: '2026-09-23 11:20',
    clicks: 76,
    likes: 45,
    shares: 8,
    isAutonomous: false
  }
];

export const DAILY_IDEAS: DailyIdea[] = [
  {
    id: 'idea-1',
    category: 'CONSEIL EXPERT : ÉVITER LE PIÈGE DU TEMPS PERDU',
    title: 'Éviter le piège du temps perdu',
    content: "C'est le piège n°1 des entreprises et agences en plein essor.\n\nEn voulant tout faire à la main, vous perdez un temps précieux que vous devriez investir dans votre stratégie de croissance.\n\nVoici 3 leviers simples à mettre en place dès aujourd'hui pour générer du trafic automatique vers votre site web sans vous épuiser.",
    hashtags: '#Productivite #MarketingDigital #PostPilot #Automation',
    cta: 'Prêt à rationaliser votre présence Facebook ? Visitez notre site web pour découvrir la plateforme !',
    recommendedMemeId: 'meme-rollsafe',
    trafficAngle: 'Résolution du manque de temps et gain de productivité immédiat.'
  },
  {
    id: 'idea-2',
    category: 'MÈMÉ VIRAL : LA RÉALITÉ DU SCROLL FACEBOOK',
    title: 'Le mème qui arrête le pouce',
    content: "99% des gens scrollent Facebook sans jamais cliquer sur une publication d'entreprise.\n\nPourquoi ? Parce que c'est trop corporatif et ennuyeux.\n\nQuand vous partagez un mème ultra-relatable avec votre audience, ils s'arrêtent, sourient... et cliquent tout naturellement sur votre site !",
    hashtags: '#HumourBusiness #AcquisitionClient #MemeViral #Growth',
    cta: '👉 Venez tester la fabrique à mèmes virale sur notre site web !',
    recommendedMemeId: 'meme-dicaprio',
    trafficAngle: 'Démontrer l\'efficacité de l\'humour pour capter l\'attention.'
  },
  {
    id: 'idea-3',
    category: 'ÉTUDE DE CAS : DU CLIC À LA VENTE RAPIDE',
    title: 'Comment transformer un like en client payant',
    content: "Avoir des likes c'est flatteur pour l'ego. Avoir des commandes sur son site web, c'est ce qui paie les factures.\n\nVoici la structure exacte en 3 étapes qu'on utilise sur nos pages pour convertir 8,4% des personnes qui voient nos posts en visiteurs actifs de notre boutique.",
    hashtags: '#Conversion #VenteEnLigne #MarketingFacebook #ROI',
    cta: 'Consultez le guide complet offert directement sur notre site web !',
    recommendedMemeId: 'meme-two-buttons',
    trafficAngle: 'Prouver la rentabilité directe et le transfert d\'audience vers le site.'
  },
  {
    id: 'idea-4',
    category: 'COMPARATIF CHOC : PUBS PAYANTES VS AUTOMATION',
    title: 'Faut-il encore payer Facebook pour être vu ?',
    content: "Dépenser 50€/jour en Facebook Ads pour des prospects froids qui ne vous connaissent pas ?\n\nOu laisser un assistant autonome publier du contenu engageant et des mèmes qui vous positionnent comme la référence de votre secteur ?\n\nLe choix est vite fait pour les entrepreneurs avisés.",
    hashtags: '#FacebookAds #StrategieDigitale #InboundMarketing #Trafic',
    cta: '🔗 Comparez les deux approches sur notre simulateur en ligne !',
    recommendedMemeId: 'meme-drake',
    trafficAngle: 'Économie d\'argent et puissance de la portée organique.'
  },
  {
    id: 'idea-5',
    category: 'ASTUCE SECRÈTE : LE LIEN EN PREMIER COMMENTAIRE VS DANS LE POST',
    title: 'Où placer son lien de site web pour un max de clics ?',
    content: "L'algorithme Facebook adore garder les gens sur sa plateforme... SAUF si votre publication suscite tellement de réactions que le lien devient incontournable.\n\nVoici la formule testée sur plus de 10 000 posts pour maximiser le taux de clics (CTR) vers votre page de destination.",
    hashtags: '#AlgorithmeFacebook #HacksMarketing #TraficWeb #PostPilot',
    cta: 'Découvrez les templates optimisés sur notre site officiel !',
    recommendedMemeId: 'meme-expanding-brain',
    trafficAngle: 'Conseil technique pointu avec forte valeur perçue.'
  }
];

export const COMMUNITY_TEMPLATES: CommunityTemplate[] = [
  {
    id: 'tpl-1',
    title: 'Le comparateur Manuel vs Automatique',
    niche: 'SaaS & Tech',
    author: 'Thomas G.',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    performance: '+42% de clics vers le site',
    clicksGenerated: 1280,
    content: "Pendant que certains passent encore leur dimanche soir à programmer leurs posts un par un... d'autres profitent de leur week-end pendant que le trafic afflue sur leur site web.\n\nLa technologie existe pour vous libérer, profitez-en !",
    hashtags: '#Productivite #GainDeTemps #Entreprendre #Automatisation',
    cta: '👉 Essayez l\'outil gratuitement sur notre site web dès aujourd\'hui',
    memeTemplateId: 'meme-drake',
    topText: 'PROGRAMMER TOUT MANUELLEMENT LE DIMANCHE SOIR',
    bottomText: 'LAISSER LE PILOTE AUTOMATIQUE ATTIRER DES CLIENTS',
    mediaUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'tpl-2',
    title: 'Le mème autocritique E-commerce',
    niche: 'E-commerce',
    author: 'Sarah M.',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    performance: '+58% d\'engagement',
    clicksGenerated: 2450,
    content: "Moi : 'Je vais juste regarder si j'ai eu une visite sur ma boutique.'\n*10 minutes plus tard devant mes stats de trafic qui explosent grâce au dernier mème*\n\nSi vous vendez des produits, votre feed Facebook doit faire rire et donner envie de commander !",
    hashtags: '#ShopifyFrance #EcommerceTips #VenteEnLigne #HumourBoutique',
    cta: '🛍️ Découvrez nos nouveautés exclusives sur le site officiel !',
    memeTemplateId: 'meme-dicaprio',
    topText: 'MOI REGARDANT LES NOTIFICATIONS DE VENTE TOMBER',
    bottomText: 'GRÂCE AUX MÈMES QUI RAMÈNENT DU MONDE SUR MA BOUTIQUE 😄',
    mediaUrl: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'tpl-3',
    title: 'L\'accroche anti-dépense inutile',
    niche: 'Freelance & Agence',
    author: 'Maxime R.',
    authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    performance: '+350 prospects en 1 mois',
    clicksGenerated: 890,
    content: "Pourquoi payer des milliers d'euros un prestataire qui poste des citations banales sur votre page Facebook ?\n\nAvec le bon angle humoristique et une redirection intelligente vers votre calendrier, vos prospects réservent directement un appel sur votre site.",
    hashtags: '#FreelanceLife #ConseilAgence #Prospection #ClientAcquisition',
    cta: '📅 Réservez votre audit offert de 15 minutes sur notre site web !',
    memeTemplateId: 'meme-rollsafe',
    topText: 'PAS BESOIN DE BUDGET PUB GIGANTESQUE',
    bottomText: 'QUAND TES CLIENTS VIENNENT DE TES MÈMES VIRAUX',
    mediaUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'tpl-4',
    title: 'Le boost vidéo court pour coachs',
    niche: 'Coaching & Formation',
    author: 'Camille D.',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
    performance: '+72% de rétention vidéo',
    clicksGenerated: 1650,
    content: "La tête de mes élèves quand ils comprennent qu'ils n'ont plus besoin de prospecter dans les DM pendant 5 heures par jour.\n\nLe système s'occupe d'amener les personnes qualifiées sur votre page de formation. Vous n'avez plus qu'à faire ce que vous aimez : transmettre !",
    hashtags: '#CoachingBusiness #FormationEnLigne #Infopreneur #Succes',
    cta: '🎓 Accédez à la masterclass offerte sur notre plateforme !',
    memeTemplateId: 'meme-video-celebration',
    topText: 'MES ÉLÈVES QUAND LE SITE SE REMPLIT EN AUTOMATIQUE',
    bottomText: 'SANS AUCUN DM ENVOYÉ À FROID 🚀',
    mediaUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'autonomous_action',
    title: 'Publication autonome validée sur PostPilot',
    message: 'Le système a analysé les meilleures heures d\'engagement et a automatiquement programmé un mème viral avec redirection vers votre site web.',
    timestamp: 'Il y a 35 min',
    date: 'Aujourd\'hui',
    read: false,
    recapData: {
      pageName: 'PostPilot',
      postText: "Moi entrain de regarder PostPilot attirer des clients sur mon site que j'ai créé avec passion 😄\n\nArrêtez de gaspiller des centaines d'euros en publicités...",
      websiteTarget: 'https://postpilot.app',
      estimatedReach: '1 250 - 2 100 vues',
      clicksGenerated: 64,
      memeTitle: 'Leonardo DiCaprio Toast'
    }
  },
  {
    id: 'notif-2',
    type: 'traffic_alert',
    title: 'Pic de trafic détecté depuis Facebook !',
    message: 'Votre publication programmée hier a généré 142 clics directs vers votre site web (+45% par rapport à la moyenne).',
    timestamp: 'Hier à 19:40',
    date: 'Hier',
    read: true,
    recapData: {
      pageName: 'PostPilot',
      postText: "C'est le piège n°1 des entreprises et agences en plein essor...",
      websiteTarget: 'https://postpilot.app',
      estimatedReach: '3 800 vues',
      clicksGenerated: 142
    }
  },
  {
    id: 'notif-3',
    type: 'daily_ideas',
    title: '5 nouvelles idées prêtes pour aujourd\'hui',
    message: 'L\'IA a préparé vos publications du jour basées sur les tendances actuelles de votre audience.',
    timestamp: 'Ce matin à 08:00',
    date: 'Aujourd\'hui',
    read: true
  }
];
