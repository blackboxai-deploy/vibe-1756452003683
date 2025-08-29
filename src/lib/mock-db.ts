"use client";

// Mock database layer for the Creator Economy Platform
import { User, Post, Comment, Like, Follow, Subscription, AnalyticsData } from './types';

// In-memory storage (in a real app, this would be replaced with actual database calls)
let users: User[] = [];
let posts: Post[] = [];
let comments: Comment[] = [];
let likes: Like[] = [];
let follows: Follow[] = [];
let subscriptions: Subscription[] = [];

// Utility function to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Current user state (mock authentication)
let currentUser: User | null = null;

// User operations
export const userDb = {
  async create(userData: Omit<User, 'id' | 'createdAt' | 'followerCount' | 'followingCount'>): Promise<User> {
    const user: User = {
      ...userData,
      id: generateId(),
      followerCount: 0,
      followingCount: 0,
      createdAt: new Date(),
    };
    users.push(user);
    return user;
  },

  async findByEmail(email: string): Promise<User | null> {
    return users.find(user => user.email === email) || null;
  },

  async findById(id: string): Promise<User | null> {
    return users.find(user => user.id === id) || null;
  },

  async findByUsername(username: string): Promise<User | null> {
    return users.find(user => user.username === username) || null;
  },

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;
    
    users[userIndex] = { ...users[userIndex], ...updates };
    return users[userIndex];
  },

  async getAll(): Promise<User[]> {
    return users;
  },

  async getCreators(): Promise<User[]> {
    return users.filter(user => user.role === 'creator');
  },

  async updateFollowerCount(userId: string, increment: number): Promise<void> {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.followerCount += increment;
    }
  },

  async updateFollowingCount(userId: string, increment: number): Promise<void> {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.followingCount += increment;
    }
  },
};

// Post operations
export const postDb = {
  async create(postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'comments' | 'views'>): Promise<Post> {
    const post: Post = {
      ...postData,
      id: generateId(),
      likes: 0,
      comments: 0,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    posts.push(post);
    return post;
  },

  async findById(id: string): Promise<Post | null> {
    return posts.find(post => post.id === id) || null;
  },

  async findByCreatorId(creatorId: string): Promise<Post[]> {
    return posts.filter(post => post.creatorId === creatorId);
  },

  async getAll(): Promise<Post[]> {
    return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getFeed(userId?: string): Promise<Post[]> {
    // Get posts from followed creators or all published posts
    let feedPosts = posts.filter(post => post.published);
    
    if (userId) {
      const userFollows = follows.filter(follow => follow.followerId === userId);
      const followingIds = userFollows.map(follow => follow.followingId);
      feedPosts = feedPosts.filter(post => 
        followingIds.includes(post.creatorId) || post.type === 'free'
      );
    } else {
      feedPosts = feedPosts.filter(post => post.type === 'free');
    }

    return feedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async update(id: string, updates: Partial<Post>): Promise<Post | null> {
    const postIndex = posts.findIndex(post => post.id === id);
    if (postIndex === -1) return null;
    
    posts[postIndex] = { 
      ...posts[postIndex], 
      ...updates, 
      updatedAt: new Date() 
    };
    return posts[postIndex];
  },

  async delete(id: string): Promise<boolean> {
    const postIndex = posts.findIndex(post => post.id === id);
    if (postIndex === -1) return false;
    
    posts.splice(postIndex, 1);
    return true;
  },

  async incrementViews(id: string): Promise<void> {
    const post = posts.find(p => p.id === id);
    if (post) {
      post.views += 1;
    }
  },

  async getTrending(): Promise<Post[]> {
    return posts
      .filter(post => post.published && post.type === 'free')
      .sort((a, b) => (b.likes + b.comments + b.views) - (a.likes + a.comments + a.views))
      .slice(0, 10);
  },
};

// Comment operations
export const commentDb = {
  async create(commentData: Omit<Comment, 'id' | 'createdAt' | 'likes' | 'replies'>): Promise<Comment> {
    const comment: Comment = {
      ...commentData,
      id: generateId(),
      likes: 0,
      replies: [],
      createdAt: new Date(),
    };
    comments.push(comment);
    
    // Update post comment count
    const post = posts.find(p => p.id === commentData.postId);
    if (post) {
      post.comments += 1;
    }
    
    return comment;
  },

  async findByPostId(postId: string): Promise<Comment[]> {
    const postComments = comments.filter(comment => comment.postId === postId);
    // Populate user data
    return postComments.map(comment => ({
      ...comment,
      user: users.find(user => user.id === comment.userId)
    }));
  },

  async delete(id: string): Promise<boolean> {
    const commentIndex = comments.findIndex(comment => comment.id === id);
    if (commentIndex === -1) return false;
    
    const comment = comments[commentIndex];
    comments.splice(commentIndex, 1);
    
    // Update post comment count
    const post = posts.find(p => p.id === comment.postId);
    if (post) {
      post.comments -= 1;
    }
    
    return true;
  },
};

// Like operations
export const likeDb = {
  async create(likeData: Omit<Like, 'id' | 'createdAt'>): Promise<Like> {
    // Check if like already exists
    const existingLike = likes.find(like => 
      like.postId === likeData.postId && like.userId === likeData.userId
    );
    if (existingLike) return existingLike;

    const like: Like = {
      ...likeData,
      id: generateId(),
      createdAt: new Date(),
    };
    likes.push(like);
    
    // Update post like count
    const post = posts.find(p => p.id === likeData.postId);
    if (post) {
      post.likes += 1;
    }
    
    return like;
  },

  async delete(postId: string, userId: string): Promise<boolean> {
    const likeIndex = likes.findIndex(like => 
      like.postId === postId && like.userId === userId
    );
    if (likeIndex === -1) return false;
    
    likes.splice(likeIndex, 1);
    
    // Update post like count
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.likes -= 1;
    }
    
    return true;
  },

  async findByUserAndPost(userId: string, postId: string): Promise<Like | null> {
    return likes.find(like => like.userId === userId && like.postId === postId) || null;
  },
};

// Follow operations
export const followDb = {
  async create(followData: Omit<Follow, 'id' | 'createdAt'>): Promise<Follow> {
    const existingFollow = follows.find(follow => 
      follow.followerId === followData.followerId && follow.followingId === followData.followingId
    );
    if (existingFollow) return existingFollow;

    const follow: Follow = {
      ...followData,
      id: generateId(),
      createdAt: new Date(),
    };
    follows.push(follow);
    
    // Update follower counts
    await userDb.updateFollowerCount(followData.followingId, 1);
    await userDb.updateFollowingCount(followData.followerId, 1);
    
    return follow;
  },

  async delete(followerId: string, followingId: string): Promise<boolean> {
    const followIndex = follows.findIndex(follow => 
      follow.followerId === followerId && follow.followingId === followingId
    );
    if (followIndex === -1) return false;
    
    follows.splice(followIndex, 1);
    
    // Update follower counts
    await userDb.updateFollowerCount(followingId, -1);
    await userDb.updateFollowingCount(followerId, -1);
    
    return true;
  },

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    return follows.some(follow => 
      follow.followerId === followerId && follow.followingId === followingId
    );
  },

  async getFollowers(userId: string): Promise<User[]> {
    const userFollows = follows.filter(follow => follow.followingId === userId);
    const followerIds = userFollows.map(follow => follow.followerId);
    return users.filter(user => followerIds.includes(user.id));
  },

  async getFollowing(userId: string): Promise<User[]> {
    const userFollows = follows.filter(follow => follow.followerId === userId);
    const followingIds = userFollows.map(follow => follow.followingId);
    return users.filter(user => followingIds.includes(user.id));
  },
};

// Subscription operations (mock)
export const subscriptionDb = {
  async create(subscriptionData: Omit<Subscription, 'id' | 'createdAt' | 'mockEarnings'>): Promise<Subscription> {
    const subscription: Subscription = {
      ...subscriptionData,
      id: generateId(),
      mockEarnings: subscriptionData.mockPrice * 0.85, // Mock 85% creator cut
      createdAt: new Date(),
    };
    subscriptions.push(subscription);
    return subscription;
  },

  async findBySupporter(supporterId: string): Promise<Subscription[]> {
    return subscriptions.filter(sub => sub.supporterId === supporterId);
  },

  async findByCreator(creatorId: string): Promise<Subscription[]> {
    return subscriptions.filter(sub => sub.creatorId === creatorId);
  },

  async isSubscribed(supporterId: string, creatorId: string): Promise<boolean> {
    return subscriptions.some(sub => 
      sub.supporterId === supporterId && 
      sub.creatorId === creatorId && 
      sub.status === 'active'
    );
  },
};

// Authentication (mock)
export const authDb = {
  async login(email: string, _password: string): Promise<User | null> {
    const user = await userDb.findByEmail(email);
    if (user) {
      currentUser = user;
      return user;
    }
    return null;
  },

  async getCurrentUser(): Promise<User | null> {
    return currentUser;
  },

  async logout(): Promise<void> {
    currentUser = null;
  },

  async setCurrentUser(user: User): Promise<void> {
    currentUser = user;
  },
};

// Analytics (mock)
export const analyticsDb = {
  async getOverview(userId: string): Promise<AnalyticsData> {
    const userPosts = await postDb.findByCreatorId(userId);
    const userSubscriptions = await subscriptionDb.findByCreator(userId);
    
    const totalViews = userPosts.reduce((sum, post) => sum + post.views, 0);
    const totalLikes = userPosts.reduce((sum, post) => sum + post.likes, 0);
    const totalComments = userPosts.reduce((sum, post) => sum + post.comments, 0);
    const totalEarnings = userSubscriptions.reduce((sum, sub) => sum + sub.mockEarnings, 0);
    
    const user = await userDb.findById(userId);
    
    return {
      userId,
      period: 'month',
      views: totalViews,
      likes: totalLikes,
      comments: totalComments,
      followers: user?.followerCount || 0,
      earnings: totalEarnings,
      topPosts: userPosts.sort((a, b) => b.views - a.views).slice(0, 5),
    };
  },
};

// Initialize with some seed data
export const initializeData = () => {
  if (users.length === 0) {
    // This will be populated by mock-data.ts
  }
};