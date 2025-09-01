import { verifyJwt } from "@/src/lib/jwt";
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: Request) {
  const cookie = (req as any).cookies?.get?.("token")?.value || "";
  const tok = cookie || (req.headers.get("cookie")||"").split("; ").find(s=>s.startsWith("token="))?.split("=")[1];
  if (!tok) return NextResponse.json(null);
  const payload = verifyJwt(tok);
  if (!payload) return NextResponse.json(null);
  const user = await prisma.user.findUnique({ where: { id: payload.uid } });
  if (!user) return NextResponse.json(null);
  return NextResponse.json({ id: user.id, email: user.email, role: user.role, name: user.name });
}
