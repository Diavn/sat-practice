import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const pwd = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const hash = await bcrypt.hash(pwd, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash: hash, role: "ADMIN", name: "Admin" },
  });

  // Sample minimal exam with 1 RW section and 1 Math section
  const exam = await prisma.exam.upsert({
    where: { code: "SAMPLE-01" },
    update: {},
    create: { code: "SAMPLE-01", title: "Sample Practice Test 1" },
  });

  const rw = await prisma.section.create({
    data: { examId: exam.id, type: "RW", order: 1, title: "RW Module 1", module: 1, timerSeconds: 32*60 }
  });
  const passage = await prisma.passage.create({
    data: { sectionId: rw.id, title: "The Benefits of Sleep", text: "Sleep plays a vital role in health. Researchers have found that consistent sleep supports memory consolidation and learning." }
  });
  const q1 = await prisma.question.create({
    data: {
      sectionId: rw.id, passageId: passage.id, number: 1,
      prompt: "The passage most strongly suggests that sleep primarily helps with:",
      type: "MC", correctAnswer: "B", explanation: "Memory consolidation is directly mentioned.",
      skill: "Information & Ideas", difficulty: "Easy"
    }
  });
  await prisma.choice.createMany({
    data: [
      { questionId: q1.id, label: "A", text: "Increasing energy use" },
      { questionId: q1.id, label: "B", text: "Consolidating memories" },
      { questionId: q1.id, label: "C", text: "Improving appetite" },
      { questionId: q1.id, label: "D", text: "Reducing physical strength" },
    ]
  });

  const math = await prisma.section.create({
    data: { examId: exam.id, type: "MATH", order: 2, title: "Math Module 1", module: 1, timerSeconds: 35*60 }
  });
  const q2 = await prisma.question.create({
    data: {
      sectionId: math.id, number: 1,
      prompt: "Solve for x: 2x + 5 = 17",
      type: "SPR", correctAnswer: "6",
      explanation: "2x = 12 so x=6", skill: "Linear equations", difficulty: "Easy", calculatorAllowed: true
    }
  });
  console.log("Seeded admin:", admin.email, "password:", pwd);
}

main().then(() => prisma.$disconnect());
