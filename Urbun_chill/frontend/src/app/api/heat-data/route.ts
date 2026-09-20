import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Placeholder for fetching heat data
    const data = [
      { lat: 40.7128, lng: -74.0060, temperature: 32 },
      { lat: 34.0522, lng: -118.2437, temperature: 35 },
    ];
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch heat data' }, { status: 500 });
  }
}
