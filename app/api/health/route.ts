import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL_UNPOOLED!);

export async function GET() {
  try {
    const [result] = await sql`SELECT 1 as ok`;
    if (result && result.ok === 1) {
      return NextResponse.json({ status: 'ok', db: true });
    }
    return NextResponse.json({ status: 'error', db: false }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ status: 'error', db: false, error: String(error) }, { status: 500 });
  }
} 