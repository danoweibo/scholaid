import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher/server";

const Schema = z.object({
  question: z.string(),
  options: z.array(z.string()).length(4),
  correct: z.number(),
  target: z.string(),
  mode: z.enum(["general", "specific"]),
});

export async function POST(req: NextRequest) {
  const body = Schema.safeParse(await req.json());
  if (!body.success)
    return NextResponse.json({ error: "Invalid" }, { status: 400 });

  await pusherServer.trigger("classroom", "question-fired", body.data);
  return NextResponse.json({ ok: true });
}
