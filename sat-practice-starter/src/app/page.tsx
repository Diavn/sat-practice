import Link from "next/link";

export default function Home() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card">
        <h1 className="text-3xl font-bold mb-2">Digital SAT Practice</h1>
        <p className="text-gray-600 mb-4">
          Practice with timed modules for Reading & Writing (2×32 minutes) and Math (2×35 minutes), review answers, and track progress.
        </p>
        <div className="flex gap-3">
          <Link className="btn btn-primary" href="/practice/rw">Start Reading &amp; Writing</Link>
          <Link className="btn" href="/practice/math">Start Math</Link>
        </div>
      </div>
      <div className="card">
        <h2 className="text-xl font-semibold mb-3">What’s inside</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Adaptive-friendly module structure (Module 1 &amp; Module 2)</li>
          <li>Passage viewer &amp; question player</li>
          <li>Timer with auto-submit on timeout</li>
          <li>Admin: import tests from JSON, manage exams &amp; sections</li>
          <li>Review mode with explanations</li>
        </ul>
      </div>
    </div>
  );
}
