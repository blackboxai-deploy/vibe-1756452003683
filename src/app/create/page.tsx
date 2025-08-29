"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { postDb } from "@/lib/mock-db";
import { CreatePostData } from "@/lib/types";
import { toast } from "sonner";

export default function CreatePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  
  const [formData, setFormData] = useState<CreatePostData>({
    title: "",
    content: "",
    type: "free",
    tags: [],
    media: undefined,
    scheduledFor: undefined,
  });

  const [currentTag, setCurrentTag] = useState("");
  const [schedule, setSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  // Redirect if not authenticated or not a creator
  if (!loading && (!user || user.role !== 'creator')) {
    router.push('/feed');
    return null;
  }

  const handleInputChange = (field: keyof CreatePostData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim().toLowerCase())) {
      const newTag = currentTag.trim().toLowerCase();
      handleInputChange('tags', [...formData.tags, newTag]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const generateAiSuggestions = async () => {
    setShowAiSuggestions(true);
    // Mock AI suggestions
    const mockSuggestions = [
      "Consider adding a personal story to make your content more relatable",
      "Break up long paragraphs with bullet points or subheadings",
      "Include a call-to-action at the end to encourage engagement",
      "Add relevant hashtags like #creativity #inspiration #tutorial",
      "Consider creating a follow-up post about common questions",
    ];
    
    // Simulate API delay
    setTimeout(() => {
      setAiSuggestions(mockSuggestions);
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    
    try {
      // Handle scheduled posts
      let scheduledFor: Date | undefined;
      if (schedule && scheduleDate && scheduleTime) {
        scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`);
      }

      // Create mock media URL if title suggests media content
      let media;
      if (formData.title.toLowerCase().includes('video')) {
        media = {
          type: 'video' as const,
          url: `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/228eeed7-cceb-43f3-9c70-c4e18e8c3891.png}+Video+Thumbnail`,
          thumbnail: `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/cd340976-cb6f-480a-b9b4-941239ef9fc1.png}+Video+Thumbnail`,
        };
      } else if (formData.title.toLowerCase().includes('image') || 
                 formData.title.toLowerCase().includes('design') ||
                 formData.title.toLowerCase().includes('photo')) {
        media = {
          type: 'image' as const,
          url: `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/3c0cf20b-8baa-4bab-b5da-1135e2be5aea.png}+Content+Image`,
        };
      }

      const postData = {
        creatorId: user.id,
        title: formData.title,
        content: formData.content,
        excerpt: formData.content.substring(0, 150) + "...",
        type: formData.type,
        tags: formData.tags,
        media,
        scheduledFor,
        published: !schedule,
        featured: false,
      };

      const newPost = await postDb.create(postData);
      
      if (schedule) {
        toast.success("Post scheduled successfully!");
      } else {
        toast.success("Post published successfully!");
      }
      
      router.push(`/post/${newPost.id}`);
    } catch (error) {
      toast.error("Failed to create post. Please try again.");
      console.error('Create post error:', error);
    } finally {
      setIsSubmitting(false);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Post</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Share your knowledge and creativity with your community
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Post Content</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Write an engaging title..."
                      required
                      maxLength={120}
                    />
                    <div className="text-xs text-gray-500 text-right">
                      {formData.title.length}/120
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="content">Content *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateAiSuggestions}
                        disabled={!formData.content}
                      >
                        ✨ AI Suggestions
                      </Button>
                    </div>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      placeholder="Share your thoughts, knowledge, or creativity..."
                      required
                      rows={12}
                      maxLength={5000}
                    />
                    <div className="text-xs text-gray-500 text-right">
                      {formData.content.length}/5000
                    </div>
                  </div>

                  {/* Post Type */}
                  <div className="space-y-3">
                    <Label>Post Type</Label>
                    <RadioGroup
                      value={formData.type}
                      onValueChange={(value) => handleInputChange('type', value)}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="free" id="free" />
                        <Label htmlFor="free" className="cursor-pointer">
                          <div className="text-sm font-medium">Free</div>
                          <div className="text-xs text-gray-500">Visible to everyone</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="premium" id="premium" />
                        <Label htmlFor="premium" className="cursor-pointer">
                          <div className="text-sm font-medium">Premium</div>
                          <div className="text-xs text-gray-500">Subscribers only</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Tags */}
                  <div className="space-y-3">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        placeholder="Add a tag..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button type="button" variant="outline" onClick={handleAddTag}>
                        Add
                      </Button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            #{tag} ✕
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Schedule */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="schedule"
                        checked={schedule}
                        onCheckedChange={setSchedule}
                      />
                      <Label htmlFor="schedule">Schedule for later</Label>
                    </div>
                    
                    {schedule && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="date">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <Label htmlFor="time">Time</Label>
                          <Input
                            id="time"
                            type="time"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-6 border-t">
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
                    >
                      {isSubmitting ? 'Creating...' : schedule ? 'Schedule Post' : 'Publish Post'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/dashboard')}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={user?.avatar}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="font-medium text-sm">{user?.name}</div>
                      <div className="text-xs text-gray-500">@{user?.username}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold line-clamp-2">
                      {formData.title || "Your post title will appear here..."}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">
                      {formData.content || "Your post content will appear here..."}
                    </p>
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {formData.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {formData.type === 'premium' && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-blue-600 text-white text-xs">
                      Premium
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            {showAiSuggestions && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    ✨ AI Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {aiSuggestions.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Analyzing your content...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {aiSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-sm"
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Writing Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <div className="text-sm">💡</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Start with a compelling hook to grab attention
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="text-sm">📝</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Use short paragraphs for better readability
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="text-sm">🏷️</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add 3-5 relevant tags to help people discover your content
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="text-sm">⏰</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Schedule posts for optimal engagement times
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}