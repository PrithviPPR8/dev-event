import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Event creation failed", error: e instanceof Error ? e.message : "Unknown" });
    }
}