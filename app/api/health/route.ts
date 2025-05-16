import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const [result] = await sql`SELECT 1 as ok`;
    if (result && result.ok === 1) {
      return NextResponse.json({ status: 'ok', db: true });
    }
    return NextResponse.json({ status: 'error', db: false }, { status: 500 });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      // En dev/local, on tolère l'absence de base et on retourne un mock
      return NextResponse.json({ status: 'ok', db: false });
    }
    return NextResponse.json({ status: 'error', db: false, error: String(error) }, { status: 500 });
  }
} 