import { prisma } from "@/src/lib/prisma";
import Link from "next/link";

export default async function RWIndex() {
  const sections = await prisma.section.findMany({ where: { type: "RW" }, orderBy: [{ examId: "asc" }, { order: "asc" }] , include: { exam: true } });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reading &amp; Writing Sections</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {sections.map(s => (
          <div key={s.id} className="card">
            <div className="text-sm text-gray-500">{s.exam.title}</div>
            <div className="font-semibold mb-1">{s.title || "Section"}</div>
            <a href={`/practice/section/${s.id}`} className="btn btn-primary">Start</a>
          </div>
        ))}
      </div>
    </div>
  );
}
