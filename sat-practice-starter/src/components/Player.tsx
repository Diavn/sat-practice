"use client";
import { useEffect, useMemo, useState } from "react";

type Choice = { id: number; label: string; text: string };
type Question = {
  id: number; number: number; prompt: string; type: "MC"|"SPR"; correctAnswer: string;
  explanation: string | null; choices: Choice[]; passage?: { text: string } | null; calculatorAllowed?: boolean | null;
};
type Section = { id: number; type: "RW"|"MATH"; title: string|null; module: number|null; timerSeconds: number|null; };
type Data = { section: Section; questions: Question[] };

export default function Player({ sectionId }: { sectionId: number }) {
  const [data, setData] = useState<Data | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, {answer: string, time: number}>>({});
  const [remaining, setRemaining] = useState<number | null>(null);
  const [startTs, setStartTs] = useState<number | null>(null);
  const [submittedAttemptId, setSubmittedAttemptId] = useState<number | null>(null);

  useEffect(()=>{
    (async()=>{
      const j: Data = await fetch(`/api/sections/${sectionId}`).then(r=>r.json());
      setData(j);
      const t = j.section.timerSeconds ?? (j.section.type === "RW" ? 32*60 : 35*60);
      setRemaining(t);
      setStartTs(Date.now());
    })();
  }, [sectionId]);

  useEffect(()=>{
    if (remaining===null) return;
    if (submittedAttemptId) return;
    const id = setInterval(()=>{
      setRemaining(v => {
        if (v===null) return v;
        if (v<=1) {
          clearInterval(id);
          handleSubmit();
          return 0;
        }
        return v-1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [remaining, submittedAttemptId]);

  const q = data?.questions[idx];
  const onAnswer = (ans: string) => {
    if (!q) return;
    const now = Date.now();
    const time = startTs ? Math.round((now - startTs)/1000) : 0;
    setAnswers(prev => ({ ...prev, [q.id]: { answer: ans, time } }));
  };

  const next = () => setIdx(i => Math.min(i+1, (data?.questions.length||1)-1));
  const prev = () => setIdx(i => Math.max(i-1, 0));

  const handleSubmit = async () => {
    if (!data) return;
    const payload = {
      sectionId: data.section.id,
      responses: Object.entries(answers).map(([qid, v]) => ({ questionId: Number(qid), answer: v.answer, timeSpentSeconds: v.time }))
    };
    const res = await fetch("/api/attempts/submit", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    const j = await res.json();
    setSubmittedAttemptId(j.sectionAttemptId || null);
    if (j.sectionAttemptId) window.location.href = `/review/section/${j.sectionAttemptId}`;
  };

  if (!data) return <div className="card">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="card flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500">{data.section.type === "RW" ? "Reading & Writing" : "Math"} (Module {data.section.module ?? "-"})</div>
          <div className="font-semibold">{data.section.title || "Section"}</div>
        </div>
        <div className="text-right">
          <div className="text-sm">Time left</div>
          <div className={"text-2xl font-bold " + ((remaining||0)<60 ? "text-red-600":"")}>
            {remaining!==null ? `${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,"0")}` : "--:--"}
          </div>
        </div>
      </div>

      {q && (
        <div className="card">
          <div className="flex items-start gap-6">
            {q.passage && (
              <div className="w-1/2 border-r pr-4">
                <div className="text-sm whitespace-pre-wrap">{q.passage.text}</div>
              </div>
            )}
            <div className={q.passage ? "w-1/2 pl-4" : "w-full"}>
              <div className="text-sm text-gray-500 mb-1">Question {q.number}</div>
              <div className="font-medium mb-3">{q.prompt}</div>
              {q.type === "MC" ? (
                <ul className="space-y-2">
                  {q.choices.map(c => {
                    const selected = answers[q.id]?.answer === c.label;
                    return (
                      <li key={c.id}>
                        <button onClick={()=>onAnswer(c.label)} className={`w-full text-left px-3 py-2 rounded-xl border ${selected ? "border-black ring-1 ring-black" : "border-gray-200 hover:bg-gray-50"}`}>
                          <span className="font-semibold mr-2">{c.label}.</span>{c.text}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div>
                  <input
                    className="border rounded-xl px-3 py-2 w-60"
                    placeholder="Enter answer"
                    value={answers[q.id]?.answer || ""}
                    onChange={e=>onAnswer(e.target.value)}
                  />
                  {q.calculatorAllowed ? <div className="text-xs text-gray-500 mt-1">Calculator allowed</div> : null}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <button className="btn" onClick={prev} disabled={idx===0}>Previous</button>
                  <button className="btn" onClick={next} disabled={idx === (data.questions.length-1)}>Next</button>
                </div>
                <button className="btn btn-primary" onClick={handleSubmit}>Submit Section</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="text-sm text-gray-700">
          Progress: {idx+1}/{data.questions.length} answered: {Object.keys(answers).length}/{data.questions.length}
        </div>
      </div>
    </div>
  );
}
