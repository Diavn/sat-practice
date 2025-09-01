import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export function signJwt(payload: object, expiresIn = "7d") {
  return jwt.sign(payload, SECRET, { expiresIn });
}

export function verifyJwt(token: string) {
  try {
    return jwt.verify(token, SECRET) as any;
  } catch {
    return null;
  }
}
