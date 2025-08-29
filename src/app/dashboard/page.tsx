"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { analyticsDb, postDb } from "@/lib/mock-db";
import { AnalyticsData, Post } from "@/lib/types";
import { generateMockEarnings } from "@/lib/mock-data";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'creator')) {
      window.location.href = '/feed';
      return;
    }

    const loadDashboardData = async () => {
      if (!user) return;

      try {
        // Load analytics overview
        const analyticsData = await analyticsDb.getOverview(user.id);
        setAnalytics(analyticsData);

        // Load recent posts
        const userPosts = await postDb.findByCreatorId(user.id);
        setRecentPosts(userPosts.slice(0, 5));
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user, loading]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'creator') return null;

  const mockEarnings = {
    daily: generateMockEarnings('daily'),
    weekly: generateMockEarnings('weekly'),
    monthly: generateMockEarnings('monthly'),
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Creator Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track your content performance and grow your community
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link href="/create">
            <Button className="w-full h-20 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <div className="text-center">
                <div className="text-2xl mb-1">✍️</div>
                <div>Create Post</div>
              </div>
            </Button>
          </Link>
          <Link href="/dashboard/posts">
            <Button variant="outline" className="w-full h-20">
              <div className="text-center">
                <div className="text-2xl mb-1">📝</div>
                <div>Manage Posts</div>
              </div>
            </Button>
          </Link>
          <Link href="/dashboard/analytics">
            <Button variant="outline" className="w-full h-20">
              <div className="text-center">
                <div className="text-2xl mb-1">📊</div>
                <div>Analytics</div>
              </div>
            </Button>
          </Link>
          <Link href={`/profile/${user.username}`}>
            <Button variant="outline" className="w-full h-20">
              <div className="text-center">
                <div className="text-2xl mb-1">👤</div>
                <div>View Profile</div>
              </div>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Views
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.views.toLocaleString()}</div>
                  <p className="text-xs text-green-600">+12% this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Likes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.likes.toLocaleString()}</div>
                  <p className="text-xs text-green-600">+8% this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Followers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.followerCount.toLocaleString()}</div>
                  <p className="text-xs text-green-600">+5 this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Posts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{recentPosts.length}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Published</p>
                </CardContent>
              </Card>
            </div>

            {/* Earnings Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Earnings Overview</CardTitle>
                <CardDescription>Your revenue breakdown (simulated)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${mockEarnings.daily}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      ${mockEarnings.weekly}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      ${mockEarnings.monthly}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Monthly Goal Progress</span>
                    <span className="text-sm text-gray-600">${mockEarnings.monthly} / $2,000</span>
                  </div>
                  <Progress value={(mockEarnings.monthly / 2000) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Recent Posts */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Posts</CardTitle>
                  <CardDescription>Your latest published content</CardDescription>
                </div>
                <Link href="/dashboard/posts">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📝</div>
                    <h3 className="font-semibold mb-2">No posts yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Create your first post to start building your audience
                    </p>
                    <Link href="/create">
                      <Button>Create Your First Post</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentPosts.map((post) => (
                      <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium line-clamp-1">{post.title}</h4>
                            {post.type === 'premium' && (
                              <Badge className="bg-gradient-to-r from-purple-500 to-blue-600 text-white text-xs">
                                Premium
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>👁️ {post.views}</span>
                            <span>❤️ {post.likes}</span>
                            <span>💬 {post.comments}</span>
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/post/${post.id}`}>
                            <Button variant="ghost" size="sm">View</Button>
                          </Link>
                          <Link href={`/dashboard/posts/edit/${post.id}`}>
                            <Button variant="outline" size="sm">Edit</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-20 h-20 rounded-full mx-auto mb-3"
                />
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h3 className="font-semibold">{user.name}</h3>
                  {user.isVerified && (
                    <Badge variant="secondary" className="text-xs px-1">✓</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  @{user.username}
                </p>
                <p className="text-xs text-gray-500 mb-4 line-clamp-3">
                  {user.bio}
                </p>
                <Link href={`/profile/${user.username}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View Public Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Growth Tips */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Growth Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="text-lg">💡</div>
                  <div>
                    <h4 className="font-medium text-sm">Post Consistently</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Aim for 3-4 posts per week to keep your audience engaged
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-lg">🎯</div>
                  <div>
                    <h4 className="font-medium text-sm">Engage with Comments</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Reply to comments to build stronger connections
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-lg">📈</div>
                  <div>
                    <h4 className="font-medium text-sm">Use Analytics</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Track which content performs best
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">This Week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Profile Views</span>
                  <span className="font-medium">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">New Followers</span>
                  <span className="font-medium text-green-600">+12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Engagement Rate</span>
                  <span className="font-medium">8.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Top Post Views</span>
                  <span className="font-medium">567</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}