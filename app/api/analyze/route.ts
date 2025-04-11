import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
// Add Gemini imports
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerateContentRequest, Part } from "@google/generative-ai";

// Initialize OpenAI client
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) { // Removed project ID check for now
  try {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      // project: process.env.OPENAI_PROJECT_ID, // Optional: Add back if needed and available
    });
    console.log("OpenAI client initialized.");
  } catch (e) {
    console.warn("Failed to initialize OpenAI client:", e);
  }
} else {
  console.warn("OPENAI_API_KEY not found. AI analysis will attempt Gemini or use fallback data.");
}

// Initialize Google Generative AI client
let genAI: GoogleGenerativeAI | null = null;
let geminiModel: any = null; // Use 'any' for simplicity, can be typed better
if (process.env.GOOGLE_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Using flash for speed/cost
    console.log("Gemini client initialized.");
  } catch(e) {
    console.warn("Failed to initialize Gemini client:", e)
  }
} else {
  console.warn("GOOGLE_API_KEY not found. AI analysis will rely on OpenAI or fallback data.");
}

// Updated fallback response structure
const fallbackResponse = {
  concernAnalysis: {
    title: "AI Analysis Unavailable",
    description: "Could not connect to AI analysis services. Please ensure API keys are configured correctly. Based on common concerns, we recommend a consultation to discuss options like hydration treatments or gentle exfoliation.",
    concerns: ["Hydration Levels", "Skin Texture"] // Added fallback concerns
  },
  potentialSolutions: {
    title: "General Recommendations",
    solutions: [
      { service: "Comprehensive Consultation", benefit: "Allows our specialists to perform tests and create a precise treatment plan tailored to you." },
      { service: "Balanced Skincare Routine", benefit: "Generally includes cleansing, moisturizing, and sun protection, adaptable to specific needs after consultation." }
    ]
  },
  nextSteps: {
    title: "Book Your Consultation",
    description: "This AI analysis is a starting point. For an accurate diagnosis and personalized plan, including necessary tests, we strongly recommend booking an in-person consultation at Khalid's Retreat. Our specialists will provide a comprehensive assessment."
  },
};

// Updated system prompt with new JSON structure for solutions and concerns list
const systemPrompt = `You are an expert AI skin consultant for "Khalid's Retreat", a high-end clinic offering Plastic Surgery, Dermatology, Aesthetic Procedures, Laser Treatments, and Hair Transplants.
Your goal is to analyze the user's provided skin concerns (text description) and/or facial photos (if provided) to identify potential issues and recommend relevant services offered ONLY by Khalid's Retreat.
Prioritize analysis based on the provided inputs. If only text is given, focus on that. If only images are given, focus on visual analysis. If both are present, integrate the information.
Be empathetic, professional, and focus on guiding the user towards a consultation at the clinic for definitive diagnosis and treatment plans.
Structure your response strictly as a JSON object with the following keys:
1. "concernAnalysis": { "title": "Concern Analysis", "description": "A brief, empathetic analysis summary (1-2 sentences).", "concerns": ["Key Concern 1", "Key Concern 2"] } - Identify 2-4 specific key concerns observed (e.g., "Mild Acne/Blemishes", "Uneven Skin Tone", "Fine Lines", "Dullness", "Enlarged Pores") and list them as strings in the concerns array.
2. "potentialSolutions": { "title": "Potential Clinic Solutions", "solutions": [ { "service": "Relevant Service Name 1", "benefit": "Brief benefit (1 sentence)" }, { "service": "Relevant Service Name 2", "benefit": "Brief benefit (1 sentence)" } ] } - Provide an array of 2-4 relevant services/treatments *specifically offered by Khalid's Retreat*. List the specific service and its primary benefit concisely.
3. "nextSteps": { "title": "Book a consultation at Khalid's Retreat for a more accurate diagnosis and treatment." }
Ensure the output is ONLY the JSON object, without any introductory text or markdown formatting.`;


export async function POST(request: Request) {
  const { description, images: base64Images } = await request.json() as { description?: string; images?: string[] };

  const hasDescription = typeof description === 'string' && description.trim().length > 0;
  const hasImages = Array.isArray(base64Images) && base64Images.length > 0;

  if (!hasDescription && !hasImages) {
    return NextResponse.json({ error: 'Please provide skin concerns description or upload at least one photo.' }, { status: 400 });
  }

  let analysisResult: any = null;
  let errorDetails: string | null = null;
  let attemptedOpenAI = false;
  let attemptedGemini = false;

  // --- Attempt OpenAI First ---
  if (openai) {
    attemptedOpenAI = true;
    try {
      console.log("Attempting OpenAI analysis...");
      // Construct messages for OpenAI API
      const openAIMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: [] }, // Content is complex type, will be populated below
      ];

      const userContentParts: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [];
      if (hasDescription) {
        userContentParts.push({ type: "text", text: `Skin Concerns Description: ${description}` });
      }
      if (hasImages) {
        userContentParts.push({ type: "text", text: `User Photos (${base64Images.length} provided): Please analyze the following facial photo(s):` });
        base64Images.forEach((base64Image) => {
          const imageUrl = base64Image.startsWith('data:image') ? base64Image : `data:image/jpeg;base64,${base64Image}`;
          userContentParts.push({ type: "image_url", image_url: { url: imageUrl, detail: "low" } });
        });
      }
      if (userContentParts.length === 0) {
        userContentParts.push({ type: "text", text: "No specific concerns or photos were provided." });
      }
      openAIMessages[1].content = userContentParts;


      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: openAIMessages,
        response_format: { type: "json_object" },
        temperature: 0.5,
        max_tokens: 500,
      });

      console.log("Received OpenAI response.");
      const choice = completion.choices[0];
      const content = choice.message?.content;

      if (!content) {
        // Log the entire completion object if content is missing
        console.error("OpenAI response content is empty. Full completion object:", JSON.stringify(completion, null, 2));
        // Throw error with finish reason if available
        throw new Error(`Empty response from OpenAI. Finish reason: ${choice.finish_reason || 'unknown'}`);
      }

      analysisResult = JSON.parse(content);
      // Validation updated to remove videoFilename check
      if (!analysisResult.concernAnalysis?.description || 
          !Array.isArray(analysisResult.concernAnalysis?.concerns) || 
          analysisResult.concernAnalysis.concerns.length === 0 || 
          !Array.isArray(analysisResult.potentialSolutions?.solutions) || 
          analysisResult.potentialSolutions.solutions.length === 0 || 
          // Check each solution only for service and benefit
          !analysisResult.potentialSolutions.solutions.every((sol: any) => 
              typeof sol.service === 'string' && 
              typeof sol.benefit === 'string'
          ) ||
          !analysisResult.nextSteps?.title) {
         console.error("OpenAI Parsed response missing required keys/subkeys, empty arrays, or invalid solution structure:", analysisResult);
         throw new Error("OpenAI response did not follow the required format.");
      }
      console.log("OpenAI analysis successful.");

    } catch (error: any) {
      console.error("Error calling OpenAI API:", error.message);
      errorDetails = `OpenAI Error: ${error.message}`;
      analysisResult = null; // Ensure result is null if OpenAI fails
    }
  }

  // --- Attempt Gemini if OpenAI failed or wasn't available ---
  if (!analysisResult && geminiModel) {
    attemptedGemini = true;
    try {
      console.log("Attempting Gemini analysis...");

      // Construct Gemini request parts
      const geminiPromptParts: Part[] = [
        { text: systemPrompt }, // System instructions first
        // User input comes next
      ];

      if (hasDescription) {
        geminiPromptParts.push({ text: `Skin Concerns Description: ${description}` });
      }
      if (hasImages) {
        geminiPromptParts.push({ text: `User Photos (${base64Images.length} provided): Please analyze the following facial photo(s):` });
        for (const base64Image of base64Images) {
          const mimeTypeMatch = base64Image.match(/^data:(image\/(?:jpeg|png|webp));base64,/);
          if (!mimeTypeMatch) {
              console.warn("Skipping image due to invalid base64 prefix or unsupported type:", base64Image.substring(0, 30));
              continue; // Skip if format is not recognized/supported
          }
          const mimeType = mimeTypeMatch[1];
          const pureBase64 = base64Image.substring(mimeTypeMatch[0].length);
          geminiPromptParts.push({
            inlineData: {
              mimeType: mimeType,
              data: pureBase64,
            },
          });
        }
      }
       if (!hasDescription && !hasImages) { // Fallback text if somehow both are missing
           geminiPromptParts.push({ text: "No specific concerns or photos were provided." });
       }


      const generationConfig = {
        temperature: 0.5,
        maxOutputTokens: 500,
        // Ensure response is JSON - Gemini specific approach
         responseMimeType: "application/json",
      };

      const safetySettings = [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ];


      const result = await geminiModel.generateContent({
           contents: [{ role: "user", parts: geminiPromptParts }],
           generationConfig,
           safetySettings,
      });


      console.log("Received Gemini response.");
      const response = result.response;
      const responseText = response.text();

      if (!responseText) {
          throw new Error("Empty response from Gemini.");
      }

      analysisResult = JSON.parse(responseText);
       // Validation updated to remove videoFilename check
       if (!analysisResult.concernAnalysis?.description || 
           !Array.isArray(analysisResult.concernAnalysis?.concerns) || 
           analysisResult.concernAnalysis.concerns.length === 0 || 
           !Array.isArray(analysisResult.potentialSolutions?.solutions) || 
           analysisResult.potentialSolutions.solutions.length === 0 ||
           // Check each solution only for service and benefit
           !analysisResult.potentialSolutions.solutions.every((sol: any) => 
              typeof sol.service === 'string' && 
              typeof sol.benefit === 'string'
            ) ||
           !analysisResult.nextSteps?.title) {
           console.error("Gemini Parsed response missing required keys/subkeys, empty arrays, or invalid solution structure:", analysisResult);
           throw new Error("Gemini response did not follow the required format.");
       }
       console.log("Gemini analysis successful.");
       errorDetails = null; // Clear previous OpenAI error if Gemini succeeded

    } catch (error: any) {
      console.error("Error calling Gemini API:", error.message);
      // Append Gemini error details if OpenAI also failed
      errorDetails = errorDetails ? `${errorDetails}; Gemini Error: ${error.message}` : `Gemini Error: ${error.message}`;
      analysisResult = null;
    }
  }

  // --- Determine Final Response ---
  if (analysisResult) {
    // Success from either OpenAI or Gemini
    return NextResponse.json({ 
        recommendations: analysisResult, 
        fallback: false, 
        message: attemptedGemini && !attemptedOpenAI ? "Analysis completed using Google Gemini." : (attemptedGemini ? "OpenAI failed, analysis completed using Google Gemini." : "Analysis completed using OpenAI."),
        errorDetails: null // Clear error details on success
    });
  } else {
    // Both failed or neither was configured/available
    console.error("Both OpenAI and Gemini analysis failed or were unavailable. Returning fallback.");
    return NextResponse.json({
      recommendations: fallbackResponse,
      fallback: true,
      message: `AI analysis failed.${!openai && !genAI ? ' Neither AI client is configured.' : ''}${openai && !attemptedOpenAI ? ' OpenAI client configured but not attempted?' : ''}${genAI && !attemptedGemini ? ' Gemini client configured but not attempted?' : ''}`,
      errorDetails: errorDetails || "No specific error details available.",
    });
  }
}