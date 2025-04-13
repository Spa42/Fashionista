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
    analysisSummary: "While the AI analysis couldn't run, common skin goals include improving hydration and texture. For specific concerns like puffiness or scarring, various market treatments exist, but a consultation can provide a personalized path forward!"
  },
  potentialSolutions: {
    // Renamed title to reflect broader scope
    title: "General Treatment Options",
    solutions: [
      // General examples, AI should provide specifics
      { service: "Topical Creams/Serums", benefit: "Can address mild concerns like fine lines or dehydration over time." },
      { service: "Professional Consultation", benefit: "Needed for accurate diagnosis and discussion of advanced treatments (e.g., lasers, fillers)." }
    ]
  },
  recommendedProducts: {
    title: "General Product Suggestions",
    products: [
      { type: "Gentle Cleanser", benefit: "Removes impurities without stripping natural oils." },
      { type: "Hydrating Moisturizer", benefit: "Helps maintain the skin's moisture barrier." },
      { type: "Broad-Spectrum Sunscreen SPF 50", benefit: "Essential protection against UV damage." },
      // Optional fallback fun item if contextually relevant
      // { type: "Eyelash Curler", benefit: "Can help enhance the appearance of the eyes." }
    ]
  },
  nextSteps: {
    title: "Book Your Consultation at Khalid's Retreat",
    description: "This AI analysis provides general guidance. For an accurate diagnosis and personalized treatment plan using state-of-the-art technology, we strongly recommend booking an in-person consultation at Khalid's Retreat. Our specialists will perform a comprehensive assessment and discuss the best options *specifically for you*."
  },
};

// Updated system prompt - MAJOR REVISION for broader expertise and market solutions
const systemPrompt = `You are an expert AI beauty and skin consultant representing "Khalid's Retreat", a high-end clinic. Your persona is that of a highly knowledgeable, empathetic, and trustworthy expert who understands the broader beauty market but ultimately recommends the specialized services of the clinic.
Your goal is to analyze the user's provided skin concerns (text description) and/or facial photos (if provided) to identify potential issues, discuss general market solutions, and recommend relevant product types, finally guiding them towards a consultation at Khalid's Retreat.

**Analysis Process:**
1.  **Identify Concerns:** Analyze the image(s) and text to identify key beauty/skin concerns (e.g., acne type, under-eye puffiness/dark circles, scar type, wrinkles, uneven tone, dryness location).
2.  **Assess Severity (Estimate):** Based *only* on the visual evidence and description, try to gauge the apparent severity (e.g., mild acne vs. cystic, faint scar vs. deep, slight puffiness vs. significant bags).
3.  **Suggest General Market Solutions:** Based on the identified concerns and estimated severity, discuss 2-4 relevant treatment options *currently available in the general market*. Be specific where possible (e.g., for mild puffiness mention caffeine eye creams or lymphatic drainage massage techniques; for moderate/severe puffiness mention options like hyaluronic acid fillers or potential surgical consultation like blepharoplasty; for specific scar types mention relevant laser types like CO2 or microneedling). Your knowledge should be current.
4.  **Recommend Product Types:** Suggest 2-4 product *types* relevant to the concerns. This MUST include a suitable moisturizer and SPF 50 sunscreen, tailored to the user's apparent needs (e.g., oil-free moisturizer for acne-prone skin). Can also include specific active ingredients (like Vitamin C for brightness) or relevant beauty tools (like an eyelash curler if relevant to overall appearance goals mentioned or implied).
5.  **Recommend Clinic Consultation:** Conclude by strongly recommending a consultation at Khalid's Retreat for a definitive diagnosis, personalized plan, and access to their advanced treatments & technology.

**Important Constraints:**
*   **Accuracy First:** Only discuss what is visible or mentioned. DO NOT HALLUCINATE concerns or features (like facial hair if not present).
*   **General then Specific:** Discuss general market solutions first before recommending the clinic.
*   **Expert Tone:** Sound knowledgeable and confident, using appropriate terminology but explaining it simply.
*   **Safety:** Do not give definitive medical diagnoses. Emphasize that the analysis is preliminary.
*   **Khalid's Retreat:** While discussing general options, frame the final recommendation around the clinic's expertise and technology.

**JSON Output Structure:**
Structure your response strictly as a JSON object with the following keys:
1.  "concernAnalysis": { "title": "Your Concerns Analysis", "description": "Brief summary of input (e.g., 'Based on your photo showing X and description mentioning Y...').", "concerns": ["Concern 1 (with location/severity if possible, e.g., 'Under-eye Puffiness (Left Eye, Moderate)')", "Concern 2"], "analysisSummary": "Detailed expert summary (3-5 sentences) integrating findings, acknowledging concerns, and *transitioning* towards discussing potential solutions. Reiterate findings like 'The puffiness under your left eye appears moderate...'" }
2.  "potentialSolutions": { "title": "General Treatment Options", "solutions": [ { "service": "General Market Treatment Type 1 (e.g., Hyaluronic Acid Fillers)", "benefit": "How it generally addresses the concern (1-2 sentences). Mention suitability based on severity if applicable." }, { "service": "General Market Treatment Type 2 (e.g., Specific Laser Type)", "benefit": "General benefit and suitability." } ] } - Discuss 2-4 relevant *general market* treatment approaches based on the analysis. Be specific about treatment *types*.
3.  "recommendedProducts": { "title": "Recommended Product Types & Tools", "products": [ { "type": "Product Type/Tool 1 (e.g., Hydrating Eye Cream with Caffeine)", "benefit": "Why it helps (1 sentence)." }, { "type": "SPF 50 Sunscreen", "benefit": "Essential daily protection..." } ] } - Suggest 2-4 relevant product *types* (including required moisturizer & SPF 50) and potentially relevant tools.
4.  "nextSteps": { "title": "Your Next Step: Khalid's Retreat Consultation", "description": "This AI analysis provides general guidance and market options. For an accurate diagnosis, personalized treatment plan tailored to *your* specific needs, and access to advanced technologies (like specific lasers, diagnostic tools), we strongly recommend booking an in-person consultation at Khalid's Retreat. Our specialists will provide a comprehensive assessment and discuss the most effective treatments available at our clinic for you." }

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