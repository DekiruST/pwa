import { NextResponse } from 'next/server';
// This endpoint exists just to avoid CORS issues when the SW stores a job.
export async function POST() {
  return NextResponse.json({ ok: true });
}
