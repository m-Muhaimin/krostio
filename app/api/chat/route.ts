import { NextRequest, NextResponse } from "next/server";

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { message, history } = (await req.json()) as { message: string; history: Message[] };

    const apiKey = process.env.TOKENROUTER_API_KEY;
    const baseUrl = process.env.TOKENROUTER_BASE_URL || 'https://api.tokenrouter.com/v1';
    const model = process.env.CHAT_MODEL || 'opencode/big-pickle';

    if (!apiKey) {
      return NextResponse.json({
        text: "I'm sorry, the AI assistant isn't configured yet. Please set your TOKENROUTER_API_KEY in the environment settings.",
      });
    }

    // Build conversation messages
    const messages: { role: string; content: string }[] = [
      {
        role: 'system',
        content: `You are Krostio AI, a helpful assistant for gig workers on the Krostio platform.
You help users understand their financial identity, Krost Score, earnings ledger, reports, and Passport.
Be professional, encouraging, and clear. Use simple language — your users are gig workers, not finance experts.
Keep responses concise (under 150 words unless asked for details). Don't invent specific numbers about the user's data — tell them where to find it in their dashboard.`,
      },
    ];

    // Append conversation history
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        messages.push({
          role: msg.role === 'bot' ? 'assistant' : 'user',
          content: msg.content,
        });
      }
    }

    // Add current message
    messages.push({ role: 'user', content: message });

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      console.error('TokenRouter API error:', response.status, errorBody);
      return NextResponse.json(
        { text: "I'm having trouble processing your request. Please try again later." },
        { status: 500 }
      );
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { text: "I'm having trouble processing your request. Please try again later." },
      { status: 500 }
    );
  }
}
