import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Extract the actual API key from the env variable
// This handles potential formatting issues like "yPENAI_API_KEY=" prefix
const cleanApiKey = (key: string | undefined): string | undefined => {
  if (!key) return undefined;
  
  // Extract API key - accept both standard sk- prefix and service account format sk-svca
  const match = key.match(/(sk-[a-zA-Z0-9-_]+)/);
  return match ? match[0] : key;
};

// Check if OpenAI API key is available
const apiKey = cleanApiKey(process.env.OPENAI_API_KEY);
console.log('API key format check:', apiKey?.substring(0, 7) + '...');

// Initialize OpenAI client with modified configuration for service account keys
let openai: OpenAI | null = null;
try {
  if (apiKey) {
    // Use a more complete configuration that works with both API key types
    openai = new OpenAI({ 
      apiKey,
      // Try setting a different base URL if using a service account or Azure key
      baseURL: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
      defaultHeaders: {
        'Content-Type': 'application/json',
      },
      dangerouslyAllowBrowser: false
    });
    console.log('OpenAI client initialized with custom configuration');
  } else {
    console.warn('No API key found');
  }
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
}

// Fallback recommendations when API is not available
const fallbackRecommendations = {
  concernAnalysis: {
    title: "General Skin Health",
    description: "Maintaining good skin health involves consistent cleansing and moisturizing."
  },
  potentialSolutions: {
    title: "Basic Skincare",
    description: "Use a gentle cleanser and a suitable moisturizer daily. Protect your skin from the sun with SPF."
  },
  nextSteps: {
    title: "Consultation Recommended",
    description: "For personalized advice tailored to your specific needs and concerns, we recommend booking a consultation at Khalid's Retreat."
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { skinConcerns, images } = body;

    // Validate input
    if (!skinConcerns && (!images || images.length === 0)) {
      return NextResponse.json(
        { error: 'Skin concerns description or images are required' },
        { status: 400 }
      );
    }
    if (images && !Array.isArray(images)) {
        return NextResponse.json({ error: 'Images must be an array of base64 strings' }, { status: 400 });
    }
    if (images && images.length > 5) { // Limit number of images
        return NextResponse.json({ error: 'Maximum of 5 images allowed' }, { status: 400 });
    }

    // If OpenAI client is not available, return fallback recommendations
    if (!openai) {
      console.warn('Using fallback recommendations: OpenAI client not initialized');
      return NextResponse.json({ 
        recommendations: fallbackRecommendations,
        fallback: true,
        message: 'Using default recommendations. OPENAI_API_KEY may be misconfigured in your .env file.'
      });
    }

    // Generate text recommendations
    let recommendations;
    
    try {
      // Construct messages for multimodal input
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: "You are an AI consultant for Khalid's Retreat, a clinic offering Plastic Surgery, Dermatology, Bariatric Surgery, Cosmetic and Medical Dentistry, ENT, Medical Nutrition, Gynecology/Obstetrics, and Wellness/Anti-Aging services. Analyze the user's specific concern based *on both the provided text description AND the uploaded images*. Provide concise, relevant information and potential solutions available at our clinic based on the visual evidence and text. Format your response as a JSON object with three keys: 'concernAnalysis' (containing 'title' and 'description' about the user's issue), 'potentialSolutions' (with 'title' and 'description' outlining relevant clinic services or approaches), and 'nextSteps' (with 'title' and 'description'). The 'nextSteps.description' MUST recommend booking a consultation at Khalid's Retreat for personalized assessment and treatment planning. Ensure the response is always valid JSON."
        },
        {
          role: 'user',
          content: [
            // Text part
            { type: "text", text: `My concerns: ${skinConcerns || "(No text description provided)"}` },
            // Image parts (if provided)
            ...(images || []).map((base64Image: string) => ({
              type: "image_url" as const, // Ensure type is correctly inferred
              image_url: {
                url: base64Image,
                detail: "high" // Use high detail for better analysis
              }
            }))
          ]
        }
      ];

      // Generate recommendations using gpt-4o
      const response = await openai.chat.completions.create({
        model: 'gpt-4o', // Use the multimodal model
        messages: messages,
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1000 // Adjust tokens if needed for potentially longer analysis
      });

      const content = response.choices[0].message.content || '{}';
      recommendations = JSON.parse(content);

    } catch (textError) {
      console.error('Text recommendation generation failed:', textError);
      // Text generation failed, use fallback
      recommendations = fallbackRecommendations;
      return NextResponse.json({ 
        recommendations,
        fallback: true,
        error: 'Failed to generate personalized recommendations. Using default recommendations instead.'
      });
    }

    // Return response without imageUrl
    return NextResponse.json({ 
      recommendations,
      fallback: false
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing the request' },
      { status: 500 }
    );
  }
}