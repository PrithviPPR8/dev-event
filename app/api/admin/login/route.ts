import { NextRequest, NextResponse } from "next/server";
import { signAdminToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, password } = body;

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }

  const token = signAdminToken();

  const response = NextResponse.json(
    { message: "Login successful" },
    { status: 200 }
  );

  response.cookies.set("admin-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
