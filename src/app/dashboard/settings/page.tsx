"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { userDb } from "@/lib/mock-db";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
    website: user?.socials?.website || "",
    twitter: user?.socials?.twitter || "",
    instagram: user?.socials?.instagram || "",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    publicProfile: true,
  });

  if (!loading && !user) {
    router.push('/login');
    return null;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferenceChange = (field: string, value: boolean) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const updatedUser = await userDb.update(user.id, {
        name: formData.name,
        username: formData.username,
        bio: formData.bio,
        socials: {
          website: formData.website,
          twitter: formData.twitter,
          instagram: formData.instagram,
        }
      });

      if (updatedUser) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
      console.error('Update profile error:', error);
    } finally {
      setIsSaving(false);
    }
  };

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

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your profile, preferences, and account security
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <nav className="space-y-2">
                  <button className="w-full text-left px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-purple-600 font-medium">
                    Profile
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300">
                    Notifications
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300">
                    Privacy
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300">
                    Billing
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 text-red-600">
                    Account
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your profile details and how others see you on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-6">
                    <img
                      src={user?.avatar}
                      alt={user?.name}
                      className="w-20 h-20 rounded-full border-4 border-purple-200 dark:border-purple-800"
                    />
                    <div>
                      <h3 className="font-medium mb-2">Profile Picture</h3>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Change Avatar
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Your full name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">@</span>
                        <Input
                          id="username"
                          value={formData.username}
                          onChange={(e) => handleInputChange('username', e.target.value)}
                          placeholder="username"
                          className="pl-8"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your@email.com"
                      disabled
                    />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell people about yourself..."
                      rows={3}
                      maxLength={160}
                    />
                    <div className="text-xs text-gray-500 text-right">
                      {formData.bio.length}/160
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Social Links</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="twitter">Twitter</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">@</span>
                            <Input
                              id="twitter"
                              value={formData.twitter}
                              onChange={(e) => handleInputChange('twitter', e.target.value)}
                              placeholder="username"
                              className="pl-8"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="instagram">Instagram</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">@</span>
                            <Input
                              id="instagram"
                              value={formData.instagram}
                              onChange={(e) => handleInputChange('instagram', e.target.value)}
                              placeholder="username"
                              className="pl-8"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <Button variant="outline">
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
                <CardDescription>
                  Your current account standing and verification status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Account Type</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {user?.role} Account
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {user?.role}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Verification Status</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user?.isVerified ? "Your account is verified" : "Account not yet verified"}
                    </p>
                  </div>
                  <Badge variant={user?.isVerified ? "default" : "secondary"}>
                    {user?.isVerified ? "✓ Verified" : "Not Verified"}
                  </Badge>
                </div>

                {!user?.isVerified && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Get Verified
                    </h5>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                      Verified accounts get a badge and increased visibility in the platform.
                    </p>
                    <Button size="sm" variant="outline" className="border-blue-600 text-blue-600">
                      Apply for Verification
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Member Since</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user?.joinedAt || '').toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>
                  Customize how you receive notifications and interact with the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive notifications about your posts and interactions
                      </p>
                    </div>
                    <Switch
                      checked={preferences.emailNotifications}
                      onCheckedChange={(value) => handlePreferenceChange('emailNotifications', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Push Notifications</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get instant notifications in your browser
                      </p>
                    </div>
                    <Switch
                      checked={preferences.pushNotifications}
                      onCheckedChange={(value) => handlePreferenceChange('pushNotifications', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Marketing Emails</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive updates about new features and platform news
                      </p>
                    </div>
                    <Switch
                      checked={preferences.marketingEmails}
                      onCheckedChange={(value) => handlePreferenceChange('marketingEmails', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Public Profile</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Allow others to discover and view your profile
                      </p>
                    </div>
                    <Switch
                      checked={preferences.publicProfile}
                      onCheckedChange={(value) => handlePreferenceChange('publicProfile', value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>
                  These actions cannot be undone. Please proceed with caution.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Deactivate Account</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Temporarily disable your account
                    </p>
                  </div>
                  <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                    Deactivate
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Delete Account</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button variant="destructive">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}