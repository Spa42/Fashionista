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
    concerns: ["Hydration Levels", "Skin Texture"],
    analysisSummary: "While the AI analysis couldn't run, common skin goals include improving hydration and texture. A consultation can provide a personalized path forward! If facial hair is a concern, we can discuss management options too."
  },
  potentialSolutions: {
    title: "General Recommendations",
    solutions: [
      { service: "Comprehensive Consultation", benefit: "Allows our specialists to perform tests and create a precise treatment plan tailored to you." },
      { service: "Balanced Skincare Routine", benefit: "Generally includes cleansing, moisturizing, and sun protection, adaptable to specific needs after consultation." }
    ]
  },
  recommendedProducts: { // Added fallback products
    title: "Basic Skincare Suggestions",
    products: [
      { type: "Gentle Cleanser", benefit: "Removes impurities without stripping natural oils." },
      { type: "Hydrating Moisturizer", benefit: "Helps maintain the skin's moisture barrier." },
      { type: "Broad-Spectrum Sunscreen", benefit: "Protects skin from harmful UV rays." },
      // Optional fallback fun item
      // { type: "Precision Trimmer", benefit: "For keeping things neat." } 
    ]
  },
  nextSteps: {
    title: "Book Your Consultation",
    description: "This AI analysis is a starting point. For an accurate diagnosis and personalized plan, including necessary tests, we strongly recommend booking an in-person consultation at Khalid's Retreat. Our specialists will provide a comprehensive assessment."
  },
};

// Updated system prompt with new JSON structure for solutions, concerns list, and product types
// Enhanced instructions for detail, tone, and acknowledging all concerns.
const systemPrompt = `You are an expert AI skin consultant for "Khalid's Retreat", a high-end clinic offering Plastic Surgery, Dermatology, Aesthetic Procedures, Laser Treatments, and Hair Transplants. Your persona should be professional, empathetic, knowledgeable, and slightly witty like a trusted clinic expert.
Your goal is to analyze the user's provided skin concerns (text description) and/or facial photos (if provided) to identify potential issues and recommend relevant services offered ONLY by Khalid's Retreat and suitable product types.
Prioritize analysis based on the provided inputs. If only text is given, focus on that. If only images are given, focus on visual analysis (e.g., mention "bags under the eyes", specify location of dryness like "around the nose", or uneven tone "on the forehead"). If both are present, integrate the information for a comprehensive analysis.
Be empathetic, professional, and focus on guiding the user towards a consultation at the clinic for definitive diagnosis and treatment plans.

IMPORTANT: Only mention features actually present in the image or text. DO NOT hallucinate or suggest conditions not clearly visible. Be especially careful with gender-specific suggestions - never mention beard or facial hair management unless clearly visible in the image or explicitly mentioned by the user. When analyzing images, be precise and observe what is actually there.

Structure your response strictly as a JSON object with the following keys:
1. "concernAnalysis": { "title": "Your Skin Concerns Analysis", "description": "A brief, empathetic analysis summary (1-2 sentences).", "concerns": ["Key Concern 1", "Key Concern 2", "Key Concern 3"], "analysisSummary": "A detailed, optimistic, and slightly witty expert summary (3-5 sentences). ONLY acknowledge concerns that are actually visible in the image or mentioned in the description text. Be specific about locations if possible (e.g., 'dryness around the mouth', 'uneven tone on cheeks'). ONLY mention facial hair if it is clearly visible in the image OR explicitly mentioned by the user. Never add comments about features that don't exist in the image." } - Identify 2-4 specific key concerns based on input, list them, AND provide the detailed, specific, and acknowledging summary here.
2. "potentialSolutions": { "title": "Potential Clinic Solutions", "solutions": [ { "service": "Relevant Service Name 1", "benefit": "Brief benefit (1 sentence)" }, { "service": "Relevant Service Name 2", "benefit": "Brief benefit (1 sentence)" } ] } - Provide an array of 2-4 relevant services/treatments *specifically offered by Khalid's Retreat*. List the specific service and its primary benefit concisely. Focus on clinic procedures.
3. "recommendedProducts": { "title": "Recommended Product Types", "products": [ { "type": "Product Type 1", "benefit": "Why it helps with identified concerns (1 sentence)" }, { "type": "Product Type 2", "benefit": "Why it helps (1 sentence)" } ] } - Suggest 2-4 product *types* relevant to the identified concerns. Briefly explain the benefit for the user's specific situation. **Crucially, this list MUST ALWAYS include a suitable moisturizer type (e.g., 'Hydrating Moisturizer') and a suitable sunscreen type (e.g., 'Broad-Spectrum Sunscreen SPF 50').** Tailor the benefit description for these two based on the user's other concerns if possible, otherwise provide a general benefit (mentioning Middle Eastern climate/sun is good). **Additionally, if the analysis suggests clogged pores, oiliness, or acne, strongly consider including a relevant cleanser type.** ONLY add a facial hair product type if facial hair is CLEARLY visible in the photo OR explicitly mentioned by the user. NEVER suggest facial hair products for images where no facial hair is visible.
4. "nextSteps": { "title": "Next Steps", "description": "Advise the user to book a consultation at Khalid's Retreat for a more accurate diagnosis and personalized treatment plan. Emphasize the value of an in-person assessment." }

Ensure the output is ONLY the JSON object, without any introductory text or markdown formatting.`;


export async function POST(request: Request) {
  // Added llmChoice to destructuring
  const { description, images: base64Images, llmChoice } = await request.json() as { description?: string; images?: string[]; llmChoice?: 'openai' | 'gemini' };

  const hasDescription = typeof description === 'string' && description.trim().length > 0;
  const hasImages = Array.isArray(base64Images) && base64Images.length > 0;

  if (!hasDescription && !hasImages) {
    return NextResponse.json({ error: 'Please provide skin concerns description or upload at least one photo.' }, { status: 400 });
  }

  let analysisResult: any = null;
  let errorDetails: string | null = null;
  let attemptedOpenAI = false;
  let attemptedGemini = false;
  let preferredLLM = llmChoice || 'openai'; // Default to OpenAI if not specified

  // --- Attempt Analysis ---
  // Function to perform OpenAI analysis
  const tryOpenAI = async () => {
    if (!openai) return false;
    attemptedOpenAI = true;
    try {
      console.log("Attempting OpenAI (Dr. Reem) analysis...");
      const openAIMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: [] },
      ];
      const userContentParts: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [];
      if (hasDescription) userContentParts.push({ type: "text", text: `Skin Concerns Description: ${description}` });
      if (hasImages) {
        userContentParts.push({ type: "text", text: `User Photos (${base64Images.length} provided): Please analyze the following facial photo(s):` });
        base64Images.forEach((base64Image) => {
          const imageUrl = base64Image.startsWith('data:image') ? base64Image : `data:image/jpeg;base64,${base64Image}`;
          userContentParts.push({ type: "image_url", image_url: { url: imageUrl, detail: "low" } });
        });
      }
      if (userContentParts.length === 0) userContentParts.push({ type: "text", text: "No specific concerns or photos were provided." });
      openAIMessages[1].content = userContentParts;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Keep mini for now, can be changed
        messages: openAIMessages,
        response_format: { type: "json_object" },
        temperature: 0.5,
        max_tokens: 600, // Slightly increase max tokens for potentially more detailed summary
      });

      console.log("Received OpenAI (Dr. Reem) response.");
      const choice = completion.choices[0];
      const content = choice.message?.content;

      if (!content) {
        console.error("OpenAI response content is empty. Full completion object:", JSON.stringify(completion, null, 2));
        throw new Error(`Empty response from OpenAI. Finish reason: ${choice.finish_reason || 'unknown'}`);
      }

      analysisResult = JSON.parse(content);
      // Add more robust validation if necessary, especially for new detailed fields if explicitly required
      if (!analysisResult.concernAnalysis?.description ||
          !Array.isArray(analysisResult.concernAnalysis?.concerns) || // No empty check here, concerns might be []
          !analysisResult.concernAnalysis?.analysisSummary ||
          !Array.isArray(analysisResult.potentialSolutions?.solutions) || // No empty check
          !analysisResult.potentialSolutions.solutions.every((sol: any) => typeof sol.service === 'string' && typeof sol.benefit === 'string') ||
          !analysisResult.recommendedProducts?.title ||
          !Array.isArray(analysisResult.recommendedProducts?.products) || // No empty check
          !analysisResult.recommendedProducts.products.every((prod: any) => typeof prod.type === 'string' && typeof prod.benefit === 'string') ||
          !analysisResult.nextSteps?.title) {
         console.error("OpenAI Parsed response missing required keys/subkeys or invalid structure:", analysisResult);
         throw new Error("OpenAI response did not follow the required format.");
      }
      console.log("OpenAI (Dr. Reem) analysis successful.");
      errorDetails = null; // Clear previous errors
      return true; // Success

    } catch (error: any) {
      console.error("Error calling OpenAI API:", error.message);
      errorDetails = `Dr. Reem (OpenAI) Error: ${error.message}`;
      analysisResult = null;
      return false; // Failure
    }
  };

  // Function to perform Gemini analysis
  const tryGemini = async () => {
     if (!geminiModel) return false;
     attemptedGemini = true;
     try {
       console.log("Attempting Gemini (Dr. Bashar) analysis...");
       const geminiPromptParts: Part[] = [{ text: systemPrompt }];
       if (hasDescription) geminiPromptParts.push({ text: `Skin Concerns Description: ${description}` });
       if (hasImages) {
         geminiPromptParts.push({ text: `User Photos (${base64Images.length} provided): Please analyze the following facial photo(s):` });
         for (const base64Image of base64Images) {
           const mimeTypeMatch = base64Image.match(/^data:(image\/(?:jpeg|png|webp));base64,/);
           if (!mimeTypeMatch) {
             console.warn("Skipping image due to invalid base64 prefix or unsupported type:", base64Image.substring(0, 30));
             continue;
           }
           const mimeType = mimeTypeMatch[1];
           const pureBase64 = base64Image.substring(mimeTypeMatch[0].length);
           geminiPromptParts.push({ inlineData: { mimeType: mimeType, data: pureBase64 } });
         }
       }
       if (!hasDescription && !hasImages) geminiPromptParts.push({ text: "No specific concerns or photos were provided." });

       const generationConfig = {
         temperature: 0.5,
         maxOutputTokens: 600, // Slightly increase max tokens
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

       console.log("Received Gemini (Dr. Bashar) response.");
       const response = result.response;
       const responseText = response.text();

       if (!responseText) throw new Error("Empty response from Gemini.");

       analysisResult = JSON.parse(responseText);
       // Add more robust validation if necessary
       if (!analysisResult.concernAnalysis?.description ||
           !Array.isArray(analysisResult.concernAnalysis?.concerns) || // No empty check
           !analysisResult.concernAnalysis?.analysisSummary ||
           !Array.isArray(analysisResult.potentialSolutions?.solutions) || // No empty check
           !analysisResult.potentialSolutions.solutions.every((sol: any) => typeof sol.service === 'string' && typeof sol.benefit === 'string') ||
           !analysisResult.recommendedProducts?.title ||
           !Array.isArray(analysisResult.recommendedProducts?.products) || // No empty check
           !analysisResult.recommendedProducts.products.every((prod: any) => typeof prod.type === 'string' && typeof prod.benefit === 'string') ||
           !analysisResult.nextSteps?.title) {
         console.error("Gemini Parsed response missing required keys/subkeys or invalid structure:", analysisResult);
         throw new Error("Gemini response did not follow the required format.");
       }
       console.log("Gemini (Dr. Bashar) analysis successful.");
       errorDetails = null; // Clear previous errors
       return true; // Success

     } catch (error: any) {
       console.error("Error calling Gemini API:", error.message);
       const geminiError = `Dr. Bashar (Gemini) Error: ${error.message}`;
       errorDetails = errorDetails ? `${errorDetails}; ${geminiError}` : geminiError;
       analysisResult = null;
       return false; // Failure
     }
  };

  // --- Execution Logic ---
  let success = false;
  if (preferredLLM === 'openai') {
    success = await tryOpenAI();
    if (!success) {
      success = await tryGemini(); // Fallback to Gemini
    }
  } else { // Preferred LLM is 'gemini'
    success = await tryGemini();
    if (!success) {
      success = await tryOpenAI(); // Fallback to OpenAI
    }
  }

  // --- Determine Final Response ---
  if (success && analysisResult) {
    let successMessage = "Analysis successful.";
    if (attemptedOpenAI && attemptedGemini) {
      // Indicates a fallback occurred
      successMessage = preferredLLM === 'openai'
        ? "Dr. Reem (OpenAI) analysis failed, completed using Dr. Bashar (Gemini)."
        : "Dr. Bashar (Gemini) analysis failed, completed using Dr. Reem (OpenAI).";
    } else if (attemptedOpenAI) {
      successMessage = "Analysis completed using Dr. Reem (OpenAI).";
    } else if (attemptedGemini) {
      successMessage = "Analysis completed using Dr. Bashar (Gemini).";
    }

    return NextResponse.json({
        recommendations: analysisResult,
        fallback: false,
        message: successMessage,
        errorDetails: null // Clear error details on success
    });
  } else {
    // Both failed or neither was configured/available
    console.error("All attempted AI analyses failed or were unavailable. Returning fallback.");
    let failMessage = `AI analysis failed.`;
    if (!openai && !genAI) {
        failMessage += ' Neither AI client is configured.';
    } else if (!openai) {
        failMessage += ' Dr. Reem (OpenAI) client not configured.';
    } else if (!genAI) {
        failMessage += ' Dr. Bashar (Gemini) client not configured.';
    }

    return NextResponse.json({
      recommendations: fallbackResponse,
      fallback: true,
      message: failMessage,
      // Ensure errorDetails includes context about which attempts failed
      errorDetails: errorDetails || "No specific error details available from attempts.",
    });
  }
}