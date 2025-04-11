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

const fallbackResponse = {
  concernAnalysis: { title: "AI Analysis Unavailable", description: "Could not connect to AI analysis services. Based on common concerns, we recommend a consultation to discuss options like hydration treatments or gentle exfoliation." },
  potentialSolutions: { title: "General Recommendations", description: "A balanced skincare routine (cleansing, moisturizing, sun protection) is generally advised. Specific treatments require consultation." },
  nextSteps: { title: "Next Steps", description: "Please schedule an appointment at Khalid's Retreat to discuss your specific needs with one of our specialists." },
};

// Define the shared system prompt structure for easier reuse
const systemPrompt = `You are an expert AI skin consultant for "Khalid's Retreat", a high-end clinic offering Plastic Surgery, Dermatology, Aesthetic Procedures, Laser Treatments, and Hair Transplants.
Your goal is to analyze the user's provided skin concerns (text description) and/or facial photos (if provided) to identify potential issues and recommend relevant services offered ONLY by Khalid's Retreat.
Prioritize analysis based on the provided inputs. If only text is given, focus on that. If only images are given, focus on visual analysis. If both are present, integrate the information.
Be empathetic, professional, and focus on guiding the user towards a consultation at the clinic for definitive diagnosis and treatment plans.
Structure your response strictly as a JSON object with the following keys, each having 'title' and 'description' sub-keys:
1. "concernAnalysis": { "title": "Concern Analysis", "description": "Brief analysis of potential concerns based on input." }
2. "potentialSolutions": { "title": "Potential Clinic Solutions", "description": "Suggest 2-3 relevant services/treatments offered *specifically by Khalid's Retreat* (e.g., Laser resurfacing, Injectable fillers, Dermatological consultation, Aesthetic facial). Keep descriptions brief." }
3. "nextSteps": { "title": "Recommended Next Steps", "description": "Politely emphasize preliminary nature of AI analysis and strongly recommend scheduling a consultation at Khalid's Retreat for personalized assessment/plan. Include the clinic name." }
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
      // Basic validation
      if (!analysisResult.concernAnalysis?.description || !analysisResult.potentialSolutions?.description || !analysisResult.nextSteps?.description) {
         console.error("OpenAI Parsed response missing required keys/subkeys:", analysisResult);
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
       // Basic validation
       if (!analysisResult.concernAnalysis?.description || !analysisResult.potentialSolutions?.description || !analysisResult.nextSteps?.description) {
           console.error("Gemini Parsed response missing required keys/subkeys:", analysisResult);
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