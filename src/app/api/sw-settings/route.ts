import { NextRequest, NextResponse } from 'next/server';

// This endpoint saves notification settings to the client's cache
// The client calls this so the Service Worker can read settings offline
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // We just return the settings — the client caches them in the SW cache
    return NextResponse.json({ success: true, settings: body });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
