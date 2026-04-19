import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const goalSchema = z.object({
  date: z.string().optional(),
  quranPages: z.number().int().min(0).default(0),
  adhkarMorning: z.boolean().default(false),
  adhkarEvening: z.boolean().default(false),
  adhkarSleep: z.boolean().default(false),
  salawatCount: z.number().int().min(0).default(0),
  qiyamAlLayl: z.boolean().default(false),
  duhaPrayer: z.boolean().default(false),
  fasting: z.boolean().default(false),
  charity: z.boolean().default(false),
  notes: z.string().default(''),
});

const DEFAULT_GOAL = {
  quranPages: 0,
  adhkarMorning: false,
  adhkarEvening: false,
  adhkarSleep: false,
  salawatCount: 0,
  qiyamAlLayl: false,
  duhaPrayer: false,
  fasting: false,
  charity: false,
  notes: '',
};

const goals = new Map<string, typeof DEFAULT_GOAL>();

function getTodayDate(dateParam?: string): string {
  if (dateParam) return dateParam;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = getTodayDate(searchParams.get('date') || undefined);

    let goal = goals.get(date);

    if (!goal) {
      goal = { date, ...DEFAULT_GOAL };
      goals.set(date, goal);
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error fetching daily goal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily goal' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = goalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.issues },
        { status: 400 }
      );
    }
    const validated = parsed.data;
    const date = validated.date || getTodayDate();

    const goal = {
      date,
      quranPages: validated.quranPages,
      adhkarMorning: validated.adhkarMorning,
      adhkarEvening: validated.adhkarEvening,
      adhkarSleep: validated.adhkarSleep,
      salawatCount: validated.salawatCount,
      qiyamAlLayl: validated.qiyamAlLayl,
      duhaPrayer: validated.duhaPrayer,
      fasting: validated.fasting,
      charity: validated.charity,
      notes: validated.notes,
    };

    goals.set(date, goal);

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error updating daily goal:', error);
    return NextResponse.json(
      { error: 'Failed to update daily goal' },
      { status: 500 }
    );
  }
}
