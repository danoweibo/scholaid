/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Streams text chunks from Gemini given a system prompt and user message.
 * Returns a ReadableStream<Uint8Array> ready to be returned from a Route Handler.
 */
export function streamGemini({
  system,
  userPrompt,
  model = "gemini-2.5-flash",
}: {
  system: string;
  userPrompt: string;
  model?: string;
}): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const geminiModel = genAI.getGenerativeModel({
          model,
          systemInstruction: system,
        });

        const result = await geminiModel.generateContentStream(userPrompt);

        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch (err) {
        console.error("Gemini stream error:", err);
        controller.enqueue(
          encoder.encode("Could not generate summary right now."),
        );
      } finally {
        controller.close();
      }
    },
  });
}

/**
 * Non-streaming Gemini call with tool use, for structured JSON output.
 */
export async function generateStructured<T>({
  system,
  userPrompt,
  tool,
  model = "gemini-2.5-flash",
}: {
  system: string;
  userPrompt: string;
  tool: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
  model?: string;
}): Promise<T | null> {
  const geminiModel = genAI.getGenerativeModel({
    model,
    systemInstruction: system,
    tools: [
      {
        functionDeclarations: [
          {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters as any,
          },
        ],
      },
    ],
  });

  const result = await geminiModel.generateContent(userPrompt);
  const call = result.response.functionCalls()?.[0];
  if (!call) return null;
  return call.args as T;
}
