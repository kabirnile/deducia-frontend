import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // CHECK 1: Is the API Key actually loaded?
    if (!apiKey) {
      return NextResponse.json({ reply: "🚨 Error: Vercel cannot find 'GEMINI_API_KEY'. Please check your Environment Variables and Redeploy." });
    }

    // CHECK 2: Send to Google
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }]
        }),
      }
    );

    const data = await response.json();

    // CHECK 3: Did Google send an error back?
    if (data.error) {
      return NextResponse.json({ reply: `🚨 Google Error: ${data.error.message}` });
    }

    // CHECK 4: Did we get a valid answer?
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiResponse) {
       return NextResponse.json({ reply: "🚨 Error: Google sent a response, but it was empty. Debug: " + JSON.stringify(data) });
    }

    return NextResponse.json({ reply: aiResponse });

  } catch (error: any) {
    return NextResponse.json({ reply: "🚨 Server Crash: " + error.message });
  }
}
