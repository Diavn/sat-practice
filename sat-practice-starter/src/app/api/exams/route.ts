import { prisma } from "@/src/lib/prisma";
export async function GET() {
  const exams = await prisma.exam.findMany({ orderBy: { id: "desc" } });
  return Response.json(exams);
}
