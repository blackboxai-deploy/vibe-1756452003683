// Mock data generator for the Creator Economy Platform
import { User } from './types';
import { userDb, postDb, followDb, subscriptionDb } from './mock-db';

const sampleCreators = [
  {
    name: "Sarah Chen",
    username: "sarahcreates",
    email: "sarah@example.com",
    avatar: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/5c300f6f-49f3-4742-8b84-b7c489cd45c2.png",
    bio: "Digital artist & UI/UX designer sharing creative processes and design tips 🎨",
    socials: {
      twitter: "@sarahcreates",
      instagram: "@sarahcreates",
      website: "sarahcreates.com"
    },
    role: 'creator' as const,
    isVerified: true,
    joinedAt: "2023-01-15",
  },
  {
    name: "Marcus Rodriguez",
    username: "fitnessmarcus",
    email: "marcus@example.com", 
    avatar: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/c1547659-930a-4123-9ef7-7fb496ccc990.png",
    bio: "Certified personal trainer helping you build strength and confidence 💪",
    socials: {
      instagram: "@fitnessmarcus",
      website: "marcusfitness.com"
    },
    role: 'creator' as const,
    isVerified: true,
    joinedAt: "2023-02-20",
  },
  {
    name: "Emma Thompson",
    username: "emmawrites",
    email: "emma@example.com",
    avatar: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/24042913-e596-4962-b383-da3330402cfe.png",
    bio: "Fantasy author & storytelling coach. Published 3 novels 📚 Writing tips & inspiration",
    socials: {
      twitter: "@emmawrites",
      website: "emmathompsonwrites.com"
    },
    role: 'creator' as const,
    isVerified: false,
    joinedAt: "2023-03-10",
  },
  {
    name: "David Kim",
    username: "techwithdavid",
    email: "david@example.com",
    avatar: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/86175ec7-00c0-42ba-9d86-c7e0f33b4db2.png",
    bio: "Full-stack developer sharing coding tutorials and tech insights 💻",
    socials: {
      twitter: "@techwithdavid",
      website: "davidkim.dev"
    },
    role: 'creator' as const,
    isVerified: true,
    joinedAt: "2023-01-05",
  },
  {
    name: "Luna Martinez",
    username: "lunacooks",
    email: "luna@example.com",
    avatar: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/ff55fbec-c427-4e16-9c98-58dfbd0bab0b.png",
    bio: "Plant-based chef & recipe developer 🌱 Healthy cooking made delicious",
    socials: {
      instagram: "@lunacooks",
      website: "lunacooks.com"
    },
    role: 'creator' as const,
    isVerified: true,
    joinedAt: "2023-02-14",
  },
  {
    name: "Alex Johnson",
    username: "alexmusic",
    email: "alex@example.com",
    avatar: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/1bef0714-256f-4df2-a97d-57928a3841ea.png",
    bio: "Indie musician & producer 🎸 Sharing my musical journey and tutorials",
    socials: {
      instagram: "@alexmusic",
      website: "alexjohnsonmusic.com"
    },
    role: 'creator' as const,
    isVerified: false,
    joinedAt: "2023-04-01",
  },
];

const sampleSupporters = [
  {
    name: "Jennifer Wilson",
    username: "jennw",
    email: "jenny@example.com",
    avatar: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/fbe1ebff-0435-45e9-aa34-d667e86a0f71.png",
    bio: "Supporting amazing creators and discovering new content 💖",
    socials: {},
    role: 'supporter' as const,
    isVerified: false,
    joinedAt: "2023-05-12",
  },
  {
    name: "Michael Brown",
    username: "mikeb",
    email: "mike@example.com",
    avatar: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/557f15e8-6317-4c5b-ba1d-f697904cc5d6.png",
    bio: "Tech enthusiast and fitness lover. Always learning!",
    socials: {},
    role: 'supporter' as const,
    isVerified: false,
    joinedAt: "2023-06-08",
  },
];

const samplePosts = [
  {
    creatorUsername: "sarahcreates",
    title: "5 Essential UI Design Principles Every Designer Should Know",
    content: "Today I want to share the fundamental principles that transformed my design work. These aren't just theoretical concepts – they're practical guidelines I use in every project.\n\n1. **Visual Hierarchy**: Guide your user's eye through strategic use of size, color, and spacing.\n\n2. **Consistency**: Maintain uniform patterns in typography, colors, and spacing throughout your design.\n\n3. **White Space**: Don't fear empty space – it gives your content room to breathe.\n\n4. **Contrast**: Use contrast not just for aesthetics, but to improve accessibility and readability.\n\n5. **Alignment**: Everything should have a visual connection to something else on the page.\n\nWhat design principle do you struggle with most? Drop a comment below! 👇",
    type: 'free' as const,
    tags: ["design", "ui", "principles", "tutorial"],
    media: {
      type: 'image' as const,
      url: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/5a0d23d7-8e70-4615-90b1-505388589787.png",
    },
    published: true,
    featured: true,
  },
  {
    creatorUsername: "sarahcreates",
    title: "Advanced Color Theory for Digital Designers (Premium)",
    content: "Ready to take your color game to the next level? In this premium post, I'm sharing advanced color harmony techniques that most designers never learn.\n\n**What you'll discover:**\n- The psychology behind color combinations\n- How to create custom color palettes that convert\n- Tools and resources I use for color inspiration\n- Real case studies from my client work\n\nThis is the knowledge that separated my amateur work from professional designs. Let's dive deep! 🎨",
    type: 'premium' as const,
    tags: ["design", "color", "premium", "advanced"],
    media: {
      type: 'image' as const,
      url: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/697655fe-f7fb-4af4-afbc-fc3cbc19f153.png",
    },
    published: true,
    featured: false,
  },
  {
    creatorUsername: "fitnessmarcus",
    title: "The Perfect Morning Workout Routine (20 Minutes)",
    content: "No time for the gym? No problem! This 20-minute morning routine will energize your day and build serious strength.\n\n**The Routine:**\n- 5 min dynamic warm-up\n- 3 rounds of:\n  - 10 push-ups\n  - 15 squats\n  - 30-second plank\n  - 10 burpees\n- 3 min cool-down stretch\n\n**Why it works:**\nThis targets all major muscle groups while getting your heart rate up. Perfect for busy professionals who want to stay fit!\n\nTry it tomorrow morning and let me know how you feel! 💪",
    type: 'free' as const,
    tags: ["fitness", "workout", "morning", "routine"],
    media: {
      type: 'video' as const,
      url: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/fbbbc682-0c05-4c34-9325-9d3f6e1fbc97.png",
      thumbnail: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/c707f513-4f6c-4892-b78a-405a97996909.png",
    },
    published: true,
    featured: true,
  },
  {
    creatorUsername: "emmawrites",
    title: "Character Development: Making Readers Fall in Love",
    content: "The secret to unforgettable characters isn't perfection – it's authenticity. Here's how I create characters that readers can't stop thinking about.\n\n**The Character Diamond:**\n1. **Surface**: What others see\n2. **Mask**: What they pretend to be\n3. **Core**: Who they really are\n4. **Shadow**: What they hide from themselves\n\n**Quick Exercise:**\nThink of your protagonist. Write one sentence for each layer of the diamond. You'll be amazed at how much depth this adds!\n\nRemember: perfect characters are boring. Flaws make them human. What's your character's biggest weakness? 📝",
    type: 'free' as const,
    tags: ["writing", "characters", "storytelling", "craft"],
    published: true,
    featured: false,
  },
  {
    creatorUsername: "techwithdavid",
    title: "Building Your First React Component: Step-by-Step Guide",
    content: "New to React? Let's build something together! Today we're creating a reusable Button component from scratch.\n\n```jsx\nfunction Button({ children, onClick, variant = 'primary' }) {\n  const baseStyles = 'px-4 py-2 rounded font-medium';\n  const variants = {\n    primary: 'bg-blue-500 text-white hover:bg-blue-600',\n    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300'\n  };\n  \n  return (\n    <button \n      className={`${baseStyles} ${variants[variant]}`}\n      onClick={onClick}\n    >\n      {children}\n    </button>\n  );\n}\n```\n\n**Key concepts covered:**\n- Props and destructuring\n- Conditional styling\n- Event handling\n- Component composition\n\nNext week: We'll add animations and TypeScript! 🚀",
    type: 'free' as const,
    tags: ["react", "javascript", "tutorial", "beginners"],
    media: {
      type: 'image' as const,
      url: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/dc76c471-ba7d-4ecf-ac35-2e94e7e03eb8.png",
    },
    published: true,
    featured: true,
  },
  {
    creatorUsername: "lunacooks",
    title: "Creamy Cashew Alfredo (Dairy-Free)",
    content: "This plant-based alfredo sauce is so creamy and delicious, you won't believe it's dairy-free! Perfect for busy weeknights.\n\n**Ingredients:**\n- 1 cup raw cashews (soaked 2 hours)\n- 1 cup unsweetened almond milk\n- 3 cloves garlic\n- 2 tbsp nutritional yeast\n- 1 tbsp lemon juice\n- Salt and pepper to taste\n\n**Instructions:**\n1. Drain and rinse cashews\n2. Blend all ingredients until silky smooth\n3. Heat in pan, thinning with pasta water as needed\n4. Toss with your favorite pasta\n\n**Chef's tip:** The secret is soaking those cashews! It makes all the difference in texture. 🌱✨",
    type: 'free' as const,
    tags: ["recipe", "vegan", "pasta", "dairy-free"],
    media: {
      type: 'image' as const,
      url: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/0c651281-f665-42a8-941c-afb32176b8b6.png",
    },
    published: true,
    featured: false,
  },
];

// Generate random engagement numbers
const getRandomEngagement = () => ({
  likes: Math.floor(Math.random() * 500) + 10,
  comments: Math.floor(Math.random() * 50) + 1,
  views: Math.floor(Math.random() * 2000) + 100,
});

// Initialize sample data
export const initializeMockData = async () => {
  try {
    // Create creators
    const createdCreators: User[] = [];
    for (const creatorData of sampleCreators) {
      const creator = await userDb.create(creatorData);
      createdCreators.push(creator);
    }

    // Create supporters
    const createdSupporters: User[] = [];
    for (const supporterData of sampleSupporters) {
      const supporter = await userDb.create(supporterData);
      createdSupporters.push(supporter);
    }

    // Create posts
    for (const postData of samplePosts) {
      const creator = createdCreators.find(c => c.username === postData.creatorUsername);
      if (creator) {
        const engagement = getRandomEngagement();
        const post = await postDb.create({
          creatorId: creator.id,
          title: postData.title,
          content: postData.content,
          excerpt: postData.content.substring(0, 150) + "...",
          type: postData.type,
          tags: postData.tags,
          media: postData.media,
          published: postData.published,
          featured: postData.featured,
        });
        
        // Update engagement stats
        await postDb.update(post.id, engagement);
      }
    }

    // Create some random follows
    const allUsers = [...createdCreators, ...createdSupporters];
    for (let i = 0; i < 20; i++) {
      const follower = allUsers[Math.floor(Math.random() * allUsers.length)];
      const following = createdCreators[Math.floor(Math.random() * createdCreators.length)];
      
      if (follower.id !== following.id) {
        try {
          await followDb.create({
            followerId: follower.id,
            followingId: following.id,
          });
        } catch (error) {
          // Ignore duplicate follows
        }
      }
    }

    // Create some mock subscriptions
    for (let i = 0; i < 10; i++) {
      const supporter = createdSupporters[Math.floor(Math.random() * createdSupporters.length)];
      const creator = createdCreators[Math.floor(Math.random() * createdCreators.length)];
      const tier = Math.random() > 0.7 ? 'premium' : 'basic';
      const mockPrice = tier === 'premium' ? 15 : 5;
      
      await subscriptionDb.create({
        supporterId: supporter.id,
        creatorId: creator.id,
        status: 'active',
        tier,
        mockPrice,
      });
    }

    console.log('✅ Mock data initialized successfully!');
    console.log(`Created ${createdCreators.length} creators, ${createdSupporters.length} supporters, and ${samplePosts.length} posts`);
    
    return {
      creators: createdCreators,
      supporters: createdSupporters,
      posts: samplePosts.length,
    };
  } catch (error) {
    console.error('❌ Error initializing mock data:', error);
    throw error;
  }
};

// Helper function to get a random creator for testing
export const getRandomCreator = () => {
  const randomIndex = Math.floor(Math.random() * sampleCreators.length);
  return sampleCreators[randomIndex];
};

// Helper function to generate random mock earnings
export const generateMockEarnings = (period: 'daily' | 'weekly' | 'monthly') => {
  const ranges = {
    daily: { min: 10, max: 200 },
    weekly: { min: 50, max: 1500 },
    monthly: { min: 200, max: 8000 },
  };
  
  const range = ranges[period];
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
};