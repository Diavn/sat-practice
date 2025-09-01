import { prisma } from "@/src/lib/prisma";
export async function GET(_: Request, { params }: { params: { id: string }}) {
  const id = Number(params.id);
  const section = await prisma.section.findUnique({ where: { id } });
  if (!section) return new Response("Not found", { status: 404 });
  const questions = await prisma.question.findMany({
    where: { sectionId: id },
    orderBy: { number: "asc" },
    include: { choices: true, passage: true }
  });
  return Response.json({ section, questions });
}
