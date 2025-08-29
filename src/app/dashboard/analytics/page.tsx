"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { analyticsDb, postDb } from "@/lib/mock-db";
import { AnalyticsData, Post } from "@/lib/types";
import { generateMockEarnings } from "@/lib/mock-data";
import Link from "next/link";

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [topPosts, setTopPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'creator')) {
      window.location.href = '/dashboard';
      return;
    }

    const loadAnalytics = async () => {
      if (!user) return;

      try {
        const analyticsData = await analyticsDb.getOverview(user.id);
        setAnalytics(analyticsData);
        setTopPosts(analyticsData.topPosts);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadAnalytics();
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

  const mockMetrics = {
    daily: {
      views: Math.floor(Math.random() * 200) + 50,
      likes: Math.floor(Math.random() * 50) + 10,
      comments: Math.floor(Math.random() * 20) + 5,
      followers: Math.floor(Math.random() * 10) + 1,
      earnings: generateMockEarnings('daily'),
    },
    weekly: {
      views: Math.floor(Math.random() * 1000) + 200,
      likes: Math.floor(Math.random() * 200) + 50,
      comments: Math.floor(Math.random() * 100) + 25,
      followers: Math.floor(Math.random() * 50) + 10,
      earnings: generateMockEarnings('weekly'),
    },
    monthly: {
      views: Math.floor(Math.random() * 5000) + 1000,
      likes: Math.floor(Math.random() * 1000) + 200,
      comments: Math.floor(Math.random() * 500) + 100,
      followers: Math.floor(Math.random() * 200) + 50,
      earnings: generateMockEarnings('monthly'),
    }
  };

  const engagementRate = analytics ? 
    ((analytics.likes + analytics.comments) / Math.max(analytics.views, 1) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Track your content performance and audience growth
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              📊 Export Data
            </Button>
            <Button variant="outline">
              📈 View Report
            </Button>
          </div>
        </div>

        {/* Time Period Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Views
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">{analytics?.views.toLocaleString()}</div>
                  <div className="flex items-center text-sm">
                    <span className="text-green-600">↗ +12%</span>
                    <span className="text-gray-500 ml-1">vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Likes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">{analytics?.likes.toLocaleString()}</div>
                  <div className="flex items-center text-sm">
                    <span className="text-green-600">↗ +8%</span>
                    <span className="text-gray-500 ml-1">vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Comments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">{analytics?.comments.toLocaleString()}</div>
                  <div className="flex items-center text-sm">
                    <span className="text-green-600">↗ +15%</span>
                    <span className="text-gray-500 ml-1">vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Followers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">{user.followerCount.toLocaleString()}</div>
                  <div className="flex items-center text-sm">
                    <span className="text-green-600">↗ +5%</span>
                    <span className="text-gray-500 ml-1">vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Engagement Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">{engagementRate}%</div>
                  <div className="flex items-center text-sm">
                    <span className="text-green-600">↗ +2.1%</span>
                    <span className="text-gray-500 ml-1">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>Your content performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Views</span>
                        <span className="text-sm text-gray-600">{analytics?.views}</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Likes</span>
                        <span className="text-sm text-gray-600">{analytics?.likes}</span>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Comments</span>
                        <span className="text-sm text-gray-600">{analytics?.comments}</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Followers</span>
                        <span className="text-sm text-gray-600">{user.followerCount}</span>
                      </div>
                      <Progress value={40} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Audience Growth</CardTitle>
                  <CardDescription>How your audience is growing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-600 mb-2">
                        {user.followerCount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Followers</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold">+{mockMetrics.daily.followers}</div>
                        <div className="text-xs text-gray-500">Today</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">+{mockMetrics.weekly.followers}</div>
                        <div className="text-xs text-gray-500">This Week</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">+{mockMetrics.monthly.followers}</div>
                        <div className="text-xs text-gray-500">This Month</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Growth Rate</span>
                        <Badge variant="outline" className="text-green-600">+5.2%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Retention Rate</span>
                        <Badge variant="outline" className="text-blue-600">94.1%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Engagement Quality</span>
                        <Badge variant="outline" className="text-purple-600">High</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            {/* Top Performing Posts */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Posts</CardTitle>
                <CardDescription>Your most successful content this month</CardDescription>
              </CardHeader>
              <CardContent>
                {topPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📊</div>
                    <h3 className="font-semibold mb-2">No content data yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Create some posts to see your performance analytics
                    </p>
                    <Link href="/create">
                      <Button>Create Your First Post</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topPosts.map((post, index) => (
                      <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium line-clamp-1">{post.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <span>👁️ {post.views.toLocaleString()}</span>
                              <span>❤️ {post.likes.toLocaleString()}</span>
                              <span>💬 {post.comments.toLocaleString()}</span>
                              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {post.type === 'premium' && (
                            <Badge className="bg-gradient-to-r from-purple-500 to-blue-600 text-white text-xs">
                              Premium
                            </Badge>
                          )}
                          <Link href={`/post/${post.id}`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Content Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Content Reach</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{analytics?.views.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">Total Impressions</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Organic</span>
                      <span>78%</span>
                    </div>
                    <Progress value={78} className="h-1" />
                    <div className="flex justify-between text-sm">
                      <span>Shared</span>
                      <span>22%</span>
                    </div>
                    <Progress value={22} className="h-1" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Engagement Quality</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{engagementRate}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">Avg. Engagement Rate</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Likes</span>
                      <span>{((analytics?.likes || 0) / Math.max(analytics?.views || 1, 1) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Comments</span>
                      <span>{((analytics?.comments || 0) / Math.max(analytics?.views || 1, 1) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Saves</span>
                      <span>2.1%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Content Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Free Posts</span>
                      <Badge variant="outline">
                        {topPosts.filter(p => p.type === 'free').length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Premium Posts</span>
                      <Badge variant="outline">
                        {topPosts.filter(p => p.type === 'premium').length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Featured Posts</span>
                      <Badge variant="outline">
                        {topPosts.filter(p => p.featured).length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="audience" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Audience Demographics</CardTitle>
                  <CardDescription>Who follows you and engages with your content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-3">Top Locations</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">United States</span>
                          <span className="text-sm text-gray-600">34%</span>
                        </div>
                        <Progress value={34} className="h-1" />
                        <div className="flex justify-between">
                          <span className="text-sm">United Kingdom</span>
                          <span className="text-sm text-gray-600">18%</span>
                        </div>
                        <Progress value={18} className="h-1" />
                        <div className="flex justify-between">
                          <span className="text-sm">Canada</span>
                          <span className="text-sm text-gray-600">12%</span>
                        </div>
                        <Progress value={12} className="h-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Follower Growth</CardTitle>
                  <CardDescription>How your following has grown over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">+{mockMetrics.daily.followers}</div>
                        <div className="text-xs text-gray-500">Today</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">+{mockMetrics.weekly.followers}</div>
                        <div className="text-xs text-gray-500">This Week</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">+{mockMetrics.monthly.followers}</div>
                        <div className="text-xs text-gray-500">This Month</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Active Followers</span>
                        <span className="text-sm font-medium">87%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">New vs Returning</span>
                        <span className="text-sm font-medium">60% / 40%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg. Session Duration</span>
                        <span className="text-sm font-medium">4m 32s</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            {/* Earnings Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Today's Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    ${mockMetrics.daily.earnings}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    +12% from yesterday
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    This Week
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    ${mockMetrics.weekly.earnings}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    +8% from last week
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    This Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    ${mockMetrics.monthly.earnings}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    +15% from last month
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Where your earnings come from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Revenue Sources</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Subscriptions</span>
                        <span className="text-sm font-medium">${Math.floor(mockMetrics.monthly.earnings * 0.7)}</span>
                      </div>
                      <Progress value={70} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Tips</span>
                        <span className="text-sm font-medium">${Math.floor(mockMetrics.monthly.earnings * 0.2)}</span>
                      </div>
                      <Progress value={20} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Other</span>
                        <span className="text-sm font-medium">${Math.floor(mockMetrics.monthly.earnings * 0.1)}</span>
                      </div>
                      <Progress value={10} className="h-2" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Payout Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Next Payout</span>
                        <span className="text-sm font-medium">Jan 1, 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Pending Balance</span>
                        <span className="text-sm font-medium">${mockMetrics.weekly.earnings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Platform Fee</span>
                        <span className="text-sm font-medium">15%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Your Cut</span>
                        <span className="text-sm font-medium text-green-600">85%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}