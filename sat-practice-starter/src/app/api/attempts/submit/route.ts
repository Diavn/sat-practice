import { prisma } from "@/src/lib/prisma";

type Payload = {
  sectionId: number;
  responses: { questionId: number; answer: string; timeSpentSeconds?: number | null }[];
};

export async function POST(req: Request) {
  const body = await req.json() as Payload;
  const section = await prisma.section.findUnique({ where: { id: body.sectionId }, include: { exam: true } });
  if (!section) return new Response("Section not found", { status: 404 });

  // For demo, create/find an anonymous student
  const anon = await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: { email: "student@example.com", passwordHash: "", role: "STUDENT", name: "Student" }
  });

  // Ensure attempt exists for this exam
  let attempt = await prisma.attempt.findFirst({ where: { userId: anon.id, examId: section.examId, completedAt: null } });
  if (!attempt) {
    attempt = await prisma.attempt.create({ data: { userId: anon.id, examId: section.examId } });
  }
  const secAttempt = await prisma.sectionAttempt.create({ data: { attemptId: attempt.id, sectionId: section.id, module: section.module ?? null } });

  // Score
  const questions = await prisma.question.findMany({ where: { id: { in: body.responses.map(r=>r.questionId) } } });
  const qMap = new Map(questions.map(q=>[q.id, q]));
  let correctCount = 0;

  for (const r of body.responses) {
    const q = qMap.get(r.questionId);
    const isCorrect = q ? (String(r.answer).trim() === String(q.correctAnswer).trim()) : false;
    if (isCorrect) correctCount += 1;
    await prisma.response.create({
      data: {
        sectionAttemptId: secAttempt.id,
        questionId: r.questionId,
        answer: r.answer,
        correct: isCorrect,
        timeSpentSeconds: r.timeSpentSeconds ?? null
      }
    });
  }

  // Update raw subscore if both sections present (simplified demo logic)
  const attemptsForExam = await prisma.sectionAttempt.findMany({ where: { attemptId: attempt.id }, include: { section: true } });
  const rwDone = attemptsForExam.filter(a=>a.section.type==="RW").length;
  const mathDone = attemptsForExam.filter(a=>a.section.type==="MATH").length;
  let data: any = {};
  if (section.type === "RW") data.rwRaw = (attempt.rwRaw||0) + correctCount;
  if (section.type === "MATH") data.mathRaw = (attempt.mathRaw||0) + correctCount;
  await prisma.attempt.update({ where: { id: attempt.id }, data });

  return Response.json({ sectionAttemptId: secAttempt.id, correct: correctCount });
}
