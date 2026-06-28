import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// We use the service role key here (server-only, never exposed to the browser)
// because this update needs to bypass RLS - the AI isn't a logged-in user,
// it's our own trusted backend updating a report on the user's behalf.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VALID_CATEGORIES = ["pothole", "streetlight", "garbage", "water_leak", "other"];
const VALID_SEVERITIES = ["low", "medium", "high"];

export async function POST(request: NextRequest) {
  try {
    const { reportId, imageUrl } = await request.json();

    if (!reportId || !imageUrl) {
      return NextResponse.json({ error: "Missing reportId or imageUrl" }, { status: 400 });
    }

    // Fetch the image and convert it to base64 - Gemini's vision API needs
    // the actual image bytes, not just a URL
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const mediaType = imageResponse.headers.get("content-type") || "image/jpeg";

    const prompt = `You are classifying a citizen-reported civic issue photo for a community problem-reporting app.

Respond with ONLY a JSON object, no other text, no markdown formatting, in this exact shape:
{"category": "pothole" | "streetlight" | "garbage" | "water_leak" | "other", "severity": "low" | "medium" | "high", "description": "one short sentence describing what's visible"}

Pick the category that best matches the main issue visible in the photo. Pick severity based on how hazardous or urgent the issue looks. Keep the description under 20 words.`;

    // Gemini's free tier occasionally returns 503 (server overloaded) under
    // heavy demand - this is transient, so we retry a couple of times with
    // a short delay rather than failing the whole categorization outright.
    let geminiResponse: Response | null = null;
    let lastErrorText = "";

    for (let attempt = 1; attempt <= 3; attempt++) {
      geminiResponse = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.GEMINI_API_KEY!,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  { inline_data: { mime_type: mediaType, data: base64Image } },
                ],
              },
            ],
          }),
        }
      );

      if (geminiResponse.ok) break;

      lastErrorText = await geminiResponse.text();
      const isRetryable = geminiResponse.status === 503 || geminiResponse.status === 429;

      if (!isRetryable || attempt === 3) {
        console.error(`Gemini API error (attempt ${attempt}):`, lastErrorText);
        return NextResponse.json({ error: "AI categorization failed" }, { status: 500 });
      }

      console.log(`Gemini overloaded, retrying (attempt ${attempt})...`);
      await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
    }

    if (!geminiResponse || !geminiResponse.ok) {
      console.error("Gemini API error after retries:", lastErrorText);
      return NextResponse.json({ error: "AI categorization failed" }, { status: 500 });
    }

    const geminiData = await geminiResponse.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    // Defensive parsing - strip markdown fences in case the model adds them anyway
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const category = VALID_CATEGORIES.includes(parsed.category) ? parsed.category : "other";
    const severity = VALID_SEVERITIES.includes(parsed.severity) ? parsed.severity : "medium";
    const description = typeof parsed.description === "string" ? parsed.description : null;

    const { error: updateError } = await supabaseAdmin
      .from("reports")
      .update({
        category,
        severity,
        ai_description: description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    if (updateError) {
      console.error("Failed to save categorization:", updateError);
      return NextResponse.json({ error: "Could not save result" }, { status: 500 });
    }

    return NextResponse.json({ category, severity, description });
  } catch (err) {
    console.error("Categorization error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

