"use client";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      window.location.href = "/admin";
    } else {
      const j = await res.json().catch(()=>({message:"Login failed"}));
      setMsg(j.message || "Login failed");
    }
  }

  return (
    <div className="max-w-md mx-auto card">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded-xl px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded-xl px-3 py-2" required />
        </div>
        {msg && <div className="text-red-600 text-sm">{msg}</div>}
        <button className="btn btn-primary w-full">Sign in</button>
      </form>
    </div>
  );
}
