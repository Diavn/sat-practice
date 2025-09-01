import { prisma } from "@/src/lib/prisma";

export default async function ReviewSection({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const secAttempt = await prisma.sectionAttempt.findUnique({ where: { id }, include: { section: true, responses: { include: { question: { include: { choices: true, passage: true } } } } } });
  if (!secAttempt) return <div className="card">Not found</div>;
  return (
    <div className="space-y-4">
      <div className="card">
        <div className="text-sm text-gray-500">{secAttempt.section.type === "RW" ? "Reading & Writing" : "Math"} Module {secAttempt.section.module ?? "-"}</div>
        <h1 className="text-2xl font-bold">Review</h1>
      </div>
      {secAttempt.responses.map((r, i) => (
        <div key={r.id} className="card">
          <div className="text-sm text-gray-500">Q{r.question.number}</div>
          {r.question.passage && <p className="text-sm mb-2 whitespace-pre-wrap">{r.question.passage.text}</p>}
          <p className="font-medium mb-2">{r.question.prompt}</p>
          {r.question.choices.length > 0 ? (
            <ul className="space-y-1">
              {r.question.choices.map(c => (
                <li key={c.id} className={"px-3 py-2 rounded-lg border " + (c.label === r.question.correctAnswer ? "border-green-500 bg-green-50" : "border-gray-200") }>
                  {c.label}. {c.text}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-2 rounded-lg border border-gray-200">Answer: {r.answer}</div>
          )}
          <div className="text-sm mt-2">Your answer: <span className={r.correct ? "text-green-600" : "text-red-600"}>{r.answer || "-"}</span></div>
          {r.question.explanation && <p className="text-sm text-gray-700 mt-2">Explanation: {r.question.explanation}</p>}
        </div>
      ))}
    </div>
  );
}
