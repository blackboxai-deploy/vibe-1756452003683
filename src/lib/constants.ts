// App constants and configuration

export const APP_NAME = "CreatorHub";
export const APP_DESCRIPTION = "The ultimate creator economy platform for content creators and supporters";

export const ROUTES = {
  HOME: '/',
  FEED: '/feed',
  DISCOVER: '/discover',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  DASHBOARD_POSTS: '/dashboard/posts',
  DASHBOARD_ANALYTICS: '/dashboard/analytics',
  DASHBOARD_SETTINGS: '/dashboard/settings',
  CREATE: '/create',
  PROFILE: '/profile',
  POST: '/post',
  NOTIFICATIONS: '/notifications',
} as const;

export const USER_ROLES = {
  CREATOR: 'creator',
  SUPPORTER: 'supporter',
} as const;

export const POST_TYPES = {
  FREE: 'free',
  PREMIUM: 'premium',
} as const;

export const SUBSCRIPTION_TIERS = {
  BASIC: {
    name: 'Basic',
    price: 5,
    features: ['Access to premium posts', 'Early access to content', 'Creator badge'],
  },
  PREMIUM: {
    name: 'Premium',
    price: 15,
    features: ['All Basic features', 'Direct messaging', '1-on-1 video calls', 'Exclusive Discord access'],
  },
} as const;

export const NOTIFICATION_TYPES = {
  LIKE: 'like',
  COMMENT: 'comment',
  FOLLOW: 'follow',
  SUBSCRIPTION: 'subscription',
  POST: 'post',
} as const;

export const BADGE_TYPES = {
  FIRST_POST: {
    name: 'First Steps',
    description: 'Published your first post',
    icon: '🎯',
    criteria: 'Create your first post',
    rarity: 'common',
  },
  HUNDRED_FOLLOWERS: {
    name: 'Rising Star',
    description: 'Reached 100 followers',
    icon: '⭐',
    criteria: 'Gain 100+ followers',
    rarity: 'rare',
  },
  VIRAL_POST: {
    name: 'Viral Creator',
    description: 'Post reached 1000+ likes',
    icon: '🚀',
    criteria: 'Get 1000+ likes on a post',
    rarity: 'epic',
  },
  CREATOR_LEGEND: {
    name: 'Creator Legend',
    description: 'Achieved 10k+ followers',
    icon: '👑',
    criteria: 'Gain 10,000+ followers',
    rarity: 'legendary',
  },
} as const;

export const MEDIA_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  PDF: 'pdf',
} as const;

export const THEME_COLORS = {
  LIGHT: {
    primary: 'from-purple-500 to-blue-600',
    secondary: 'from-pink-500 to-rose-500',
    accent: 'emerald-400',
    background: 'white',
    foreground: 'gray-900',
  },
  DARK: {
    primary: 'from-purple-400 to-blue-500',
    secondary: 'from-pink-400 to-rose-400',
    accent: 'emerald-300',
    background: 'gray-900',
    foreground: 'white',
  },
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE: '/api/users/update',
    FOLLOW: '/api/users/follow',
    UNFOLLOW: '/api/users/unfollow',
  },
  POSTS: {
    LIST: '/api/posts',
    CREATE: '/api/posts/create',
    UPDATE: '/api/posts/update',
    DELETE: '/api/posts/delete',
    LIKE: '/api/posts/like',
    UNLIKE: '/api/posts/unlike',
  },
  COMMENTS: {
    LIST: '/api/comments',
    CREATE: '/api/comments/create',
    DELETE: '/api/comments/delete',
  },
  AI: {
    SUGGESTIONS: '/api/ai/suggestions',
    OPTIMIZE: '/api/ai/optimize',
  },
  ANALYTICS: {
    OVERVIEW: '/api/analytics/overview',
    DETAILED: '/api/analytics/detailed',
  },
} as const;

export const MOCK_EARNINGS_RANGES = {
  DAILY: { min: 10, max: 200 },
  WEEKLY: { min: 50, max: 1500 },
  MONTHLY: { min: 200, max: 8000 },
} as const;

export const CONTENT_LIMITS = {
  TITLE_MAX: 120,
  CONTENT_MAX: 5000,
  BIO_MAX: 160,
  TAGS_MAX: 10,
} as const;