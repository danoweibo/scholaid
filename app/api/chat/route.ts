/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/chat/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // All messages except the last one become history
    const history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;

    const chat = model.startChat({
      history,
      systemInstruction: `You are an academic tutor helping university students with their coursework.
You assist with explaining concepts, reviewing essays, and solving practice problems.
You do NOT write assignments for students — instead guide them to the answer.
Keep explanations clear and encourage critical thinking.`,
    });
    const result = await chat.sendMessageStream(lastMessage);

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) controller.enqueue(new TextEncoder().encode(text));
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err: any) {
    // This logs the real error in your terminal
    console.error("Gemini API error:", err?.message ?? err);
    return new Response(
      JSON.stringify({ error: err?.message ?? "Unknown error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
