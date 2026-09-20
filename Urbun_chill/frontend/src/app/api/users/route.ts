import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    { id: 1, name: 'Admin', email: 'admin@urbanchill.ai', role: 'admin' },
  ]);
}
