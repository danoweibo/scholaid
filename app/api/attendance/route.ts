import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { generateStructured } from "@/lib/inference";

const Schema = z.object({ topic: z.string().min(1).max(200) });

interface QuestionResult {
  question: string;
  options: string[];
  correct: number;
}

const fallback = (
  topic: string,
  error?: string,
): QuestionResult & { error?: string } => ({
  question: `Quick check on ${topic}?`,
  options: ["Option A", "Option B", "Option C", "Option D"],
  correct: 0,
  ...(error ? { error } : {}),
});

export async function POST(req: NextRequest) {
  const body = Schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { topic } = body.data;

  try {
    const result = await generateStructured<QuestionResult>({
      system:
        "You write quick attendance-check questions for university lectures. Output ONE concise multiple-choice question with exactly 4 short answer options and the index (0-3) of the correct one.",
      userPrompt: `Topic: ${topic}. Generate one quick multiple choice question to verify students are paying attention.`,
      tool: {
        name: "emit_question",
        description: "Emit the generated question",
        parameters: {
          type: "object",
          properties: {
            question: { type: "string" },
            options: {
              type: "array",
              items: { type: "string" },
              minItems: 4,
              maxItems: 4,
            },
            correct: { type: "integer", minimum: 0, maximum: 3 },
          },
          required: ["question", "options", "correct"],
        },
      },
    });

    if (!result)
      return NextResponse.json(fallback(topic, "No tool call returned."));

    return NextResponse.json({
      question: String(result.question),
      options: (result.options as string[]).slice(0, 4),
      correct: Math.min(3, Math.max(0, Number(result.correct) || 0)),
    });
  } catch (err) {
    console.error("Attendance question error:", err);
    return NextResponse.json(fallback(topic, "Could not generate question."));
  }
}
