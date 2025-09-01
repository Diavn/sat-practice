import { prisma } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { signJwt } from "@/src/lib/jwt";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

  const token = signJwt({ uid: user.id, role: user.role, email: user.email });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("token", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  return res;
}
