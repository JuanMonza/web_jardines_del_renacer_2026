import { NextResponse } from 'next/server';
import { getSedesFromDB } from '@/lib/sedesStorageDB';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  try { return NextResponse.json({ data: await getSedesFromDB() }); }
  catch { return NextResponse.json({ data: [] }, { status: 500 }); }
}
