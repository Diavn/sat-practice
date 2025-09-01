import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { z } from "zod";

const schema = z.object({
  exam: z.object({ code: z.string(), title: z.string() }),
  sections: z.array(z.object({
    type: z.enum(["RW","MATH"]),
    order: z.number().int(),
    title: z.string().nullable().optional(),
    module: z.number().int().nullable().optional(),
    timerSeconds: z.number().int().nullable().optional(),
  })),
  passages: z.array(z.object({
    sectionOrder: z.number().int(),
    title: z.string().nullable().optional(),
    text: z.string(),
  })).optional(),
  questions: z.array(z.object({
    sectionOrder: z.number().int(),
    number: z.number().int(),
    prompt: z.string(),
    type: z.enum(["MC","SPR"]).default("MC"),
    correctAnswer: z.string(),
    explanation: z.string().nullable().optional(),
    skill: z.string().nullable().optional(),
    difficulty: z.string().nullable().optional(),
    calculatorAllowed: z.boolean().nullable().optional(),
    passageIndex: z.number().int().nullable().optional(),
    choices: z.record(z.string()).optional()
  }))
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json(parsed.error.flatten(), { status: 400 });
  const data = parsed.data;

  // Upsert exam
  const exam = await prisma.exam.upsert({
    where: { code: data.exam.code },
    update: { title: data.exam.title },
    create: { code: data.exam.code, title: data.exam.title }
  });

  // Create sections indexed by order
  const createdSections: Record<number, number> = {};
  for (const s of data.sections) {
    const sec = await prisma.section.create({
      data: { examId: exam.id, type: s.type, order: s.order, title: s.title ?? null, module: s.module ?? null, timerSeconds: s.timerSeconds ?? null }
    });
    createdSections[s.order] = sec.id;
  }

  // Create passages
  const passagesByIndex: Record<string, number> = {};
  if (data.passages) {
    for (let i=0;i<data.passages.length;i++) {
      const p = data.passages[i];
      const secId = createdSections[p.sectionOrder];
      if (!secId) continue;
      const created = await prisma.passage.create({ data: { sectionId: secId, title: p.title ?? null, text: p.text } });
      passagesByIndex[`${p.sectionOrder}:${i+1}`] = created.id;
    }
  }

  // Create questions
  for (const q of data.questions) {
    const secId = createdSections[q.sectionOrder];
    if (!secId) continue;
    const created = await prisma.question.create({
      data: {
        sectionId: secId, passageId: q.passageIndex ? passagesByIndex[`${q.sectionOrder}:${q.passageIndex}`] ?? null : null,
        number: q.number, prompt: q.prompt, type: q.type, correctAnswer: q.correctAnswer,
        explanation: q.explanation ?? null, skill: q.skill ?? null, difficulty: q.difficulty ?? null,
        calculatorAllowed: q.calculatorAllowed ?? null
      }
    });
    if (q.type === "MC" && q.choices) {
      for (const key of Object.keys(q.choices)) {
        await prisma.choice.create({ data: { questionId: created.id, label: key, text: q.choices[key] } });
      }
    }
  }

  return NextResponse.json({ ok: true, examId: exam.id });
}
