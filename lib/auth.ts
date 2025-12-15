import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET!;

export type AdminTokenPayload = {
  role: "admin";
};

export function signAdminToken() {
  return jwt.sign(
    { role: "admin" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
  } catch {
    return null;
  }
}
