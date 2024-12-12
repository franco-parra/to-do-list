import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const DEVISE_JWT_SECRET_KEY = process.env.DEVISE_JWT_SECRET_KEY || "";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { token } = body;

  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, DEVISE_JWT_SECRET_KEY);
    return NextResponse.json({ message: "Token is valid", decoded });
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
