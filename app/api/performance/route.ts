import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { streamGemini } from "@/lib/inference";

const Schema = z.object({
  role: z.enum(["student", "lecturer"]),
  metrics: z.object({
    score: z.number(),
    attendance: z.number(),
    participation: z.number(),
  }),
});

export async function POST(req: NextRequest) {
  const body = Schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { role, metrics } = body.data;

  const audience =
    role === "student"
      ? "Speak directly to the student in second person."
      : "Speak about the class as a whole to the lecturer.";

  const userPrompt = `${audience} Provide a short (about 90 words) plain-language interpretation of these performance metrics. Focus on what they mean and one actionable next step. Do not use markdown headings, just paragraphs.

Average Daily Score: ${metrics.score}/100
Attendance Rating: ${metrics.attendance}/100
Participation Quality: ${metrics.participation}/100`;

  const stream = streamGemini({
    system: "You are an academic coach. Be warm, specific, and brief.",
    userPrompt,
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
