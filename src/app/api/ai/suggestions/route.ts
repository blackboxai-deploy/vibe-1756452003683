import { NextRequest, NextResponse } from 'next/server';

// Mock AI suggestion endpoint using our custom AI gateway
export async function POST(request: NextRequest) {
  try {
    const { content, title, type } = await request.json();

    if (!content && !title) {
      return NextResponse.json({
        success: false,
        message: 'Content or title required'
      }, { status: 400 });
    }

    // Mock AI API call to our custom endpoint
    const aiResponse = await fetch('https://oi-server.onrender.com/chat/completions', {
      method: 'POST',
      headers: {
        'customerId': 'cus_SfpbfpkXmvLLt0',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer xxx',
      },
      body: JSON.stringify({
        model: 'openrouter/anthropic/claude-sonnet-4',
        messages: [
          {
            role: 'system',
            content: `You are a content optimization expert for creators. Analyze the given content and provide 5 practical, actionable suggestions to improve engagement, readability, and audience connection. Focus on:
            1. Content structure and formatting
            2. Engagement hooks and CTAs
            3. Hashtag and SEO optimization
            4. Audience connection techniques
            5. Platform-specific best practices
            
            Return only a JSON array of suggestion strings, no other text.`
          },
          {
            role: 'user',
            content: `Content Type: ${type || 'general'}
            Title: ${title || 'No title provided'}
            Content: ${content || 'No content provided'}
            
            Please analyze and provide 5 specific improvement suggestions.`
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!aiResponse.ok) {
      console.error('AI API failed:', await aiResponse.text());
      // Fallback to static suggestions
      return NextResponse.json({
        success: true,
        suggestions: [
          "Consider adding a compelling hook in your opening sentence to grab attention immediately",
          "Break up long paragraphs into shorter, more digestible chunks for better readability",
          "Include a clear call-to-action at the end to encourage audience engagement",
          "Add relevant hashtags to increase discoverability (aim for 3-5 specific tags)",
          "Consider adding a personal anecdote or story to make your content more relatable"
        ],
        hashtags: ["#creator", "#content", "#tips"],
        engagement_prediction: Math.floor(Math.random() * 30) + 70 // 70-100%
      });
    }

    const aiResult = await aiResponse.json();
    let suggestions: string[] = [];

    try {
      // Try to parse the AI response as JSON array
      if (aiResult.choices && aiResult.choices[0]?.message?.content) {
        const content = aiResult.choices[0].message.content.trim();
        // Remove any markdown formatting and parse JSON
        const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
        suggestions = JSON.parse(cleanContent);
      }
    } catch (parseError) {
      console.error('Failed to parse AI suggestions:', parseError);
      // Fallback suggestions
      suggestions = [
        "Consider adding a compelling hook in your opening sentence to grab attention immediately",
        "Break up long paragraphs into shorter, more digestible chunks for better readability",
        "Include a clear call-to-action at the end to encourage audience engagement",
        "Add relevant hashtags to increase discoverability (aim for 3-5 specific tags)",
        "Consider adding a personal anecdote or story to make your content more relatable"
      ];
    }

    // Generate mock hashtags based on content
    const words = (title + ' ' + content).toLowerCase().split(/\s+/);
    const relevantWords = words.filter(word => 
      word.length > 4 && 
      !['this', 'that', 'with', 'from', 'they', 'have', 'been', 'will'].includes(word)
    );
    const hashtags = relevantWords.slice(0, 5).map(word => `#${word}`);

    return NextResponse.json({
      success: true,
      suggestions: Array.isArray(suggestions) ? suggestions.slice(0, 5) : [
        "Consider adding a compelling hook in your opening sentence",
        "Break up long paragraphs for better readability",
        "Include a clear call-to-action at the end",
        "Add relevant hashtags to increase discoverability",
        "Consider adding a personal story to make it relatable"
      ],
      hashtags: hashtags.slice(0, 5),
      engagement_prediction: Math.floor(Math.random() * 30) + 70, // 70-100%
      optimizedContent: content // Could be enhanced by AI in real implementation
    });

  } catch (error) {
    console.error('AI Suggestions API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to generate suggestions'
    }, { status: 500 });
  }
}