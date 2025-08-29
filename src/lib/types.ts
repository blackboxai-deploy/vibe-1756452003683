// Core type definitions for the Creator Economy Platform

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  role: 'creator' | 'supporter';
  socials: {
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  followerCount: number;
  followingCount: number;
  isVerified: boolean;
  joinedAt: string;
  createdAt: Date;
}

export interface Post {
  id: string;
  creatorId: string;
  title: string;
  content: string;
  excerpt?: string;
  type: 'free' | 'premium';
  media?: {
    type: 'image' | 'video' | 'pdf';
    url: string;
    thumbnail?: string;
  };
  tags: string[];
  likes: number;
  comments: number;
  views: number;
  scheduledFor?: Date;
  published: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user?: User;
  text: string;
  likes: number;
  replies: Comment[];
  createdAt: Date;
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface Subscription {
  id: string;
  supporterId: string;
  creatorId: string;
  status: 'active' | 'cancelled' | 'paused';
  tier: 'basic' | 'premium';
  mockPrice: number;
  mockEarnings: number;
  createdAt: Date;
  expiresAt?: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'subscription' | 'post';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

export interface AnalyticsData {
  userId: string;
  period: 'day' | 'week' | 'month';
  views: number;
  likes: number;
  comments: number;
  followers: number;
  earnings: number;
  topPosts: Post[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  badge?: Badge;
  earnedAt: Date;
}

export type Theme = 'light' | 'dark';

export interface AppState {
  user: User | null;
  theme: Theme;
  notifications: Notification[];
  isLoading: boolean;
}

export interface CreatePostData {
  title: string;
  content: string;
  type: 'free' | 'premium';
  tags: string[];
  media?: {
    type: 'image' | 'video' | 'pdf';
    file: File;
  };
  scheduledFor?: Date;
}

export interface AIResponse {
  suggestions: string[];
  optimizedContent?: string;
  hashtags?: string[];
  engagement_prediction?: number;
}