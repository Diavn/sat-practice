"use client";
import { useEffect, useState } from "react";

type Exam = { id: number; code: string; title: string };
type Section = { id: number; type: "RW"|"MATH"; order: number; title: string | null; module: number | null; timerSeconds: number | null; };

export default function Admin() {
  const [me, setMe] = useState<any>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [jsonText, setJsonText] = useState("");
  const [status, setStatus] = useState<string|null>(null);

  useEffect(()=>{
    (async()=>{
      const m = await fetch("/api/auth/me").then(r=>r.ok?r.json():null).catch(()=>null);
      setMe(m);
      const list = await fetch("/api/exams").then(r=>r.json()).catch(()=>[]);
      setExams(list);
    })();
  }, []);

  const importJson = async () => {
    setStatus("Importing...");
    try {
      const payload = JSON.parse(jsonText);
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("Imported!");
      const list = await fetch("/api/exams").then(r=>r.json());
      setExams(list);
    } catch (e: any) {
      setStatus("Failed: " + e.message);
    }
  };

  if (!me || me.role !== "ADMIN") {
    return (
      <div className="card">
        <h1 className="text-2xl font-bold mb-2">Admin</h1>
        <p>Please <a className="text-blue-600 underline" href="/login">sign in</a> as an admin.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card">
        <h2 className="text-xl font-semibold mb-2">Import Test JSON</h2>
        <p className="text-sm text-gray-600 mb-2">Paste JSON with shape: {{ exam, sections, passages, questions }}. See README for schema.</p>
        <textarea value={jsonText} onChange={e=>setJsonText(e.target.value)} className="w-full h-60 border rounded-xl p-3 font-mono text-xs"></textarea>
        <div className="mt-3 flex gap-2">
          <button onClick={importJson} className="btn btn-primary">Import</button>
          <button onClick={()=>setJsonText(sample)} className="btn">Load sample</button>
        </div>
        {status && <div className="text-sm mt-2">{status}</div>}
      </div>
      <div className="card">
        <h2 className="text-xl font-semibold mb-3">Exams</h2>
        <ul className="space-y-2">
          {exams.map(e=>(
            <li key={e.id} className="border rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">{e.title}</div>
                <div className="text-xs text-gray-500">{e.code}</div>
              </div>
              <a className="btn" href={`/exams/${e.id}`}>Open</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const sample = JSON.stringify({
  exam: { code: "SAMPLE-JSON-01", title: "Imported Sample Test" },
  sections: [
    { type: "RW", order: 1, title: "RW Module 1", module: 1, timerSeconds: 32*60 },
    { type: "MATH", order: 2, title: "Math Module 1", module: 1, timerSeconds: 35*60 }
  ],
  passages: [
    { sectionOrder: 1, title: "Honeybees", text: "Honeybees communicate via waggle dance to share food locations." }
  ],
  questions: [
    {
      sectionOrder: 1, number: 1, prompt: "The passage suggests the waggle dance is used to:", type: "MC", correctAnswer: "C",
      explanation: "It conveys direction and distance to food sources.",
      choices: { A: "Find mates", B: "Build hives", C: "Share foraging info", D: "Defend colony" },
      passageIndex: 1, difficulty: "Easy", skill: "Information & Ideas"
    },
    {
      sectionOrder: 2, number: 1, prompt: "If 3x - 7 = 11, what is x?", type: "SPR", correctAnswer: "6", explanation: "3x = 18 => x=6", difficulty: "Easy", skill: "Linear equations", calculatorAllowed: true
    }
  ]
}, null, 2);
