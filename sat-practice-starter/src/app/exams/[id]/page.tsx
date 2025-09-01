import { prisma } from "@/src/lib/prisma";
import Link from "next/link";

export default async function ExamPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const exam = await prisma.exam.findUnique({ where: { id }, include: { sections: { orderBy: { order: "asc" } } } });
  if (!exam) return <div className="card">Not found</div>;
  return (
    <div className="space-y-4">
      <div className="card">
        <h1 className="text-2xl font-bold">{exam.title}</h1>
        <div className="text-sm text-gray-500">{exam.code}</div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {exam.sections.map(s => (
          <div key={s.id} className="card">
            <div className="font-semibold mb-1">{s.title || (s.type === "RW" ? "Reading & Writing" : "Math")} (Module {s.module ?? "-"})</div>
            <div className="text-sm text-gray-600 mb-2">Timer: {s.timerSeconds ? Math.round(s.timerSeconds/60) : (s.type==="RW"?32:35)} minutes</div>
            <Link href={`/practice/section/${s.id}`} className="btn btn-primary">Practice this section</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
