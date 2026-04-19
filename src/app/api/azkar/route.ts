import { NextResponse } from 'next/server';
import azkarData from '@/data/azkar.json';

export async function GET() {
  try {
    return NextResponse.json(azkarData);
  } catch (error) {
    console.error('Failed to fetch azkar:', error);
    return NextResponse.json(
      { error: 'Failed to fetch azkar' },
      { status: 500 }
    );
  }
}
