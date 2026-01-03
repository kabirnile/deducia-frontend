import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ reply: "🚨 Error: Vercel cannot find 'GEMINI_API_KEY'." });
    }

    // FIX: Switched from 'gemini-1.5-flash' to the stable 'gemini-pro'
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }]
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ reply: `🚨 Google Error: ${data.error.message}` });
    }

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiResponse) {
       return NextResponse.json({ reply: "🚨 Error: Google sent an empty response." });
    }

    return NextResponse.json({ reply: aiResponse });

  } catch (error: any) {
    return NextResponse.json({ reply: "🚨 Server Crash: " + error.message });
  }
}
