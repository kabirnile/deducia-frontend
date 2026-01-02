import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Get the user's message from the frontend
    const { message } = await req.json();

    // 2. Prepare the payload for Gemini
    const payload = {
      contents: [
        {
          parts: [
            { text: message } // The user's question
          ]
        }
      ]
    };

    // 3. Send to Google's Gemini API (using gemini-1.5-flash for speed)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    // 4. Extract the text answer
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";

    // 5. Send back to Frontend
    return NextResponse.json({ reply: aiResponse });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ reply: "Internal Server Error" }, { status: 500 });
  }
}
