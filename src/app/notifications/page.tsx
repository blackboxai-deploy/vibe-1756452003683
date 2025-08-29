"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

interface MockNotification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'subscription' | 'post' | 'mention';
  title: string;
  message: string;
  user?: {
    name: string;
    username: string;
    avatar: string;
    isVerified?: boolean;
  };
  post?: {
    id: string;
    title: string;
  };
  read: boolean;
  createdAt: Date;
}

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const [notifications, setNotifications] = useState<MockNotification[]>([
    {
      id: '1',
      type: 'like',
      title: 'New Like',
      message: 'liked your post',
      user: {
        name: 'Alex Johnson',
        username: 'alexmusic',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
        isVerified: false,
      },
      post: {
        id: '1',
        title: '5 Essential UI Design Principles Every Designer Should Know',
      },
      read: false,
      createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    },
    {
      id: '2',
      type: 'comment',
      title: 'New Comment',
      message: 'commented on your post',
      user: {
        name: 'Emma Thompson',
        username: 'emmawrites',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9b35086?w=400&h=400&fit=crop&crop=face',
        isVerified: true,
      },
      post: {
        id: '2',
        title: 'The Perfect Morning Workout Routine (20 Minutes)',
      },
      read: false,
      createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    },
    {
      id: '3',
      type: 'follow',
      title: 'New Follower',
      message: 'started following you',
      user: {
        name: 'Michael Brown',
        username: 'mikeb',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      },
      read: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
    {
      id: '4',
      type: 'subscription',
      title: 'New Subscription',
      message: 'subscribed to your content',
      user: {
        name: 'Jennifer Wilson',
        username: 'jennw',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      },
      read: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: '5',
      type: 'post',
      title: 'Creator Update',
      message: 'Emma Thompson published a new post',
      user: {
        name: 'Emma Thompson',
        username: 'emmawrites',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9b35086?w=400&h=400&fit=crop&crop=face',
        isVerified: true,
      },
      post: {
        id: '3',
        title: 'Character Development: Making Readers Fall in Love',
      },
      read: true,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
    {
      id: '6',
      type: 'mention',
      title: 'Mentioned',
      message: 'mentioned you in a post',
      user: {
        name: 'David Kim',
        username: 'techwithdavid',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
        isVerified: true,
      },
      post: {
        id: '4',
        title: 'Building Your First React Component: Step-by-Step Guide',
      },
      read: true,
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    },
  ]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to be logged in to view notifications.
          </p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return '❤️';
      case 'comment': return '💬';
      case 'follow': return '👤';
      case 'subscription': return '⭐';
      case 'post': return '📝';
      case 'mention': return '🏷️';
      default: return '🔔';
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const filteredNotifications = {
    all: notifications,
    unread: notifications.filter(n => !n.read),
    mentions: notifications.filter(n => n.type === 'mention'),
    follows: notifications.filter(n => n.type === 'follow'),
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Notifications
              {unreadCount > 0 && (
                <Badge className="ml-3 bg-red-500 text-white">
                  {unreadCount} new
                </Badge>
              )}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Stay updated with your latest interactions and activity
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notification Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="relative">
              All
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({filteredNotifications.unread.length})
            </TabsTrigger>
            <TabsTrigger value="mentions">
              Mentions ({filteredNotifications.mentions.length})
            </TabsTrigger>
            <TabsTrigger value="follows">
              Follows ({filteredNotifications.follows.length})
            </TabsTrigger>
          </TabsList>

          {Object.entries(filteredNotifications).map(([key, notifList]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              {notifList.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="text-6xl mb-4">🔔</div>
                    <h3 className="text-xl font-semibold mb-2">No notifications</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {key === 'unread' 
                        ? "You're all caught up! No unread notifications."
                        : `No ${key} notifications yet.`
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {notifList.map((notification) => (
                    <Card 
                      key={notification.id} 
                      className={`hover:shadow-md transition-all duration-200 cursor-pointer ${
                        !notification.read 
                          ? 'border-l-4 border-l-purple-500 bg-purple-50 dark:bg-purple-950/10' 
                          : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                      }`}
                      onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          {/* Notification Icon */}
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-lg">
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>

                          {/* User Avatar */}
                          {notification.user && (
                            <Link 
                              href={`/profile/${notification.user.username}`}
                              className="flex-shrink-0"
                            >
                              <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-slate-800">
                                <AvatarImage 
                                  src={notification.user.avatar} 
                                  alt={notification.user.name} 
                                />
                                <AvatarFallback>
                                  {notification.user.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            </Link>
                          )}

                          {/* Notification Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {notification.user && (
                                    <Link 
                                      href={`/profile/${notification.user.username}`}
                                      className="font-semibold text-gray-900 dark:text-white hover:text-purple-600 transition-colors"
                                    >
                                      {notification.user.name}
                                    </Link>
                                  )}
                                  {notification.user?.isVerified && (
                                    <Badge variant="secondary" className="text-xs px-1">✓</Badge>
                                  )}
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {notification.message}
                                  </span>
                                </div>

                                {/* Post reference */}
                                {notification.post && (
                                  <Link 
                                    href={`/post/${notification.post.id}`}
                                    className="block mt-2 p-2 bg-gray-50 dark:bg-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                  >
                                    <p className="text-sm font-medium line-clamp-1">
                                      {notification.post.title}
                                    </p>
                                  </Link>
                                )}
                              </div>

                              {/* Timestamp and unread indicator */}
                              <div className="flex items-center space-x-2 ml-4">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {getTimeAgo(notification.createdAt)}
                                </span>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Notification Settings */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive notifications via email
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Push Notifications</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get instant browser notifications
                </p>
              </div>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Notification Frequency</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose how often you get notified
                </p>
              </div>
              <Button variant="outline" size="sm">
                Customize
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}