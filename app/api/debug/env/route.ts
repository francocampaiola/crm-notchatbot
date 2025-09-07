import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasQstashToken: !!process.env.QSTASH_TOKEN,
    hasQstashUrl: !!process.env.QSTASH_URL,
    hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
    qstashUrl: process.env.QSTASH_URL,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    tokenLength: process.env.QSTASH_TOKEN?.length || 0,
    tokenStart: process.env.QSTASH_TOKEN?.substring(0, 10) || "none",
  });
}
