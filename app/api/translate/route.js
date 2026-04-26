// import { NextResponse } from "next/server";

// const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const { text, medicines, language } = body;

//     if (!text || text.trim().length < 10) {
//       return NextResponse.json(
//         { error: "No report text provided to translate." },
//         { status: 400 }
//       );
//     }

//     const apiKey = process.env.GROQ_API_KEY;
//     if (!apiKey) {
//       return NextResponse.json(
//         { error: "Translation service not configured." },
//         { status: 500 }
//       );
//     }

//     const langName = language === "hindi" ? "Hindi" : "Marathi";
//     const medicineList =
//       medicines && medicines.length > 0
//         ? `\nDetected medicines: ${medicines.join(", ")}`
//         : "";

//     const prompt = `You are a medical report translator helping rural Indian patients understand their medical reports.

// The following is extracted text from a medical report or prescription:
// ---
// ${text}${medicineList}
// ---

// Please do the following in ${langName}:
// 1. Write a SHORT, SIMPLE summary (3-5 sentences) of what this report says — in very simple ${langName} that a non-educated person can understand. No medical jargon.
// 2. List any medicines found and explain what each one is generally used for (in simple ${langName}).
// 3. Give ONE clear action: should the patient see a doctor urgently, take rest, or follow up?
// 4. Add a short disclaimer that this is AI-generated and they should consult a real doctor.

// Format your response as JSON with these exact keys:
// {
//   "summary": "...",
//   "medicines": [{"name": "...", "use": "..."}],
//   "action": "...",
//   "disclaimer": "..."
// }

// Respond ONLY with the JSON. No extra text.`;

//     const response = await fetch(GROQ_API_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${apiKey}`,
//       },
//       body: JSON.stringify({
//         model: "llama-3.3-70b-versatile",
//         messages: [{ role: "user", content: prompt }],
//         max_tokens: 1024,
//         temperature: 0.3,
//       }),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data?.error?.message || "Groq API error");
//     }

//     const raw = data?.choices?.[0]?.message?.content || "";

//     // Parse JSON from response
//     let parsed;
//     try {
//       const jsonMatch = raw.match(/\{[\s\S]*\}/);
//       parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
//     } catch {
//       // If JSON parsing fails, return raw text
//       parsed = {
//         summary: raw,
//         medicines: [],
//         action: "",
//         disclaimer: "",
//       };
//     }

//     return NextResponse.json({
//       success: true,
//       language: langName,
//       translation: parsed,
//     });
//   } catch (error) {
//     console.error("[translate] Error:", error.message);
//     return NextResponse.json(
//       { error: error.message || "Translation failed. Please try again." },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const SUPPORTED_LANGUAGES = {
  hindi:      { name: "Hindi",      native: "हिंदी" },
  marathi:    { name: "Marathi",    native: "मराठी" },
  bengali:    { name: "Bengali",    native: "বাংলা" },
  tamil:      { name: "Tamil",      native: "தமிழ்" },
  telugu:     { name: "Telugu",     native: "తెలుగు" },
  gujarati:   { name: "Gujarati",   native: "ગુજરાતી" },
  kannada:    { name: "Kannada",    native: "ಕನ್ನಡ" },
  malayalam:  { name: "Malayalam",  native: "മലയാളം" },
  punjabi:    { name: "Punjabi",    native: "ਪੰਜਾਬੀ" },
  odia:       { name: "Odia",       native: "ଓଡ଼ିଆ" },
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { text, medicines, language } = body;

    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { error: "No report text provided to translate." },
        { status: 400 }
      );
    }

    const langConfig = SUPPORTED_LANGUAGES[language];
    if (!langConfig) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}. Supported: ${Object.keys(SUPPORTED_LANGUAGES).join(", ")}` },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Translation service not configured." },
        { status: 500 }
      );
    }

    const medicineList =
      medicines && medicines.length > 0
        ? `\nDetected medicines: ${medicines.join(", ")}`
        : "";

    const prompt = `You are a medical report translator helping rural Indian patients understand their medical reports.

The following is extracted text from a medical report or prescription:
---
${text}${medicineList}
---

Please do the following in ${langConfig.name} (${langConfig.native}):
1. Write a SHORT, SIMPLE summary (3-5 sentences) of what this report says in very simple ${langConfig.name} that a non-educated person can understand. No medical jargon.
2. List any medicines found and explain what each one is generally used for in simple ${langConfig.name}.
3. Give ONE clear action: should the patient see a doctor urgently, take rest, or follow up?
4. Add a short disclaimer in ${langConfig.name} that this is AI-generated and they should consult a real doctor.

Format your response as JSON with these exact keys:
{
  "summary": "...",
  "medicines": [{"name": "...", "use": "..."}],
  "action": "...",
  "disclaimer": "..."
}

Respond ONLY with valid JSON. No extra text outside the JSON.`;

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1024,
        temperature: 0.3,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || "Groq API error");
    }

    const raw = data?.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch {
      parsed = { summary: raw, medicines: [], action: "", disclaimer: "" };
    }

    return NextResponse.json({
      success: true,
      language: langConfig.name,
      native: langConfig.native,
      translation: parsed,
    });
  } catch (error) {
    console.error("[translate] Error:", error.message);
    return NextResponse.json(
      { error: error.message || "Translation failed. Please try again." },
      { status: 500 }
    );
  }
}

